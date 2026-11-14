/**
 * Cliente SSE sobre fetch.
 *
 * No se usa el EventSource nativo porque no permite enviar headers, y el
 * backend autentica con `Authorization: Bearer <token>`. Poner el token en la
 * URL lo dejaría expuesto en logs de servidores y proxies.
 *
 * Funcionalidades:
 *  - Parseo del protocolo SSE (`event:`, `data:`, comentarios `:`).
 *  - Reconexión automática con backoff exponencial (1s, 2s, 4s… hasta 30s).
 *  - Watchdog: si no llega nada (ni el heartbeat `ping` del backend) en
 *    `idleTimeoutMs`, la conexión se da por muerta y se reabre.
 *  - 401/403 detienen los reintentos (token vencido o sin permiso).
 *  - `onOpen` avisa si la conexión es una reconexión, para que quien escucha
 *    recupere lo que se perdió (el servidor no reenvía eventos perdidos).
 */

export interface SseMessage {
  event: string;
  data: string;
}

export interface EventStreamOptions {
  url: string;
  token: string;
  onMessage: (message: SseMessage) => void;
  /** Se llama cada vez que el servidor acepta la conexión (200). */
  onOpen?: (info: { isReconnect: boolean }) => void;
  /**
   * Se llama una sola vez cuando el servidor rechaza la conexión (401/403).
   * `errorCode` es el del cuerpo de la respuesta, si se pudo leer.
   */
  onFatalError?: (status: number, errorCode?: string) => void;
  /** Tiempo sin recibir datos antes de reconectar. El backend envía ping cada 30s. */
  idleTimeoutMs?: number;
}

const INITIAL_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;
const DEFAULT_IDLE_TIMEOUT_MS = 75_000;

class FatalStreamError extends Error {
  constructor(
    public status: number,
    public errorCode?: string,
  ) {
    super(`SSE rechazado con status ${status}`);
  }
}

async function readErrorCode(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { errorCode?: unknown };
    return typeof body.errorCode === "string" ? body.errorCode : undefined;
  } catch {
    return undefined;
  }
}

function parseBlock(block: string): SseMessage | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue; // comentario / keep-alive
    const sep = line.indexOf(":");
    const field = sep === -1 ? line : line.slice(0, sep);
    // Según la spec, se ignora un único espacio tras los dos puntos
    const value = sep === -1 ? "" : line.slice(sep + 1).replace(/^ /, "");

    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

/**
 * Abre el stream y lo mantiene vivo hasta llamar a la función devuelta.
 * @returns función para cerrar el stream definitivamente.
 */
export function openEventStream({
  url,
  token,
  onMessage,
  onOpen,
  onFatalError,
  idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
}: EventStreamOptions): () => void {
  let closed = false;
  let retryDelay = INITIAL_RETRY_MS;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let wakeUp: (() => void) | undefined;
  let currentController: AbortController | null = null;
  let hasConnected = false;

  const connectOnce = async () => {
    const controller = new AbortController();
    currentController = controller;

    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => controller.abort(), idleTimeoutMs);
    };

    try {
      resetIdle();
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      if (res.status === 401 || res.status === 403) {
        throw new FatalStreamError(res.status, await readErrorCode(res));
      }
      if (!res.ok || !res.body) {
        throw new Error(`SSE respondió ${res.status}`);
      }

      // Conexión establecida: el próximo corte vuelve a empezar desde 1s
      retryDelay = INITIAL_RETRY_MS;
      onOpen?.({ isReconnect: hasConnected });
      hasConnected = true;

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        resetIdle();

        buffer += value;
        // Si el chunk termina en "\r", su "\n" puede llegar en el siguiente:
        // se deja pendiente para no convertir un "\r\n" partido en "\n\n".
        const pendingCR = buffer.endsWith("\r");
        if (pendingCR) buffer = buffer.slice(0, -1);
        buffer = buffer.replace(/\r\n?/g, "\n");

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const message = parseBlock(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          if (message) onMessage(message);
          boundary = buffer.indexOf("\n\n");
        }
        if (pendingCR) buffer += "\r";
      }
    } finally {
      clearTimeout(idleTimer);
    }
  };

  const loop = async () => {
    while (!closed) {
      try {
        await connectOnce();
        // El servidor cerró el stream limpiamente: reconectar
      } catch (error) {
        if (closed) return;
        if (error instanceof FatalStreamError) {
          onFatalError?.(error.status, error.errorCode);
          return;
        }
        // Error de red, timeout del watchdog o 5xx: se reintenta
      }
      if (closed) return;

      await new Promise<void>((resolve) => {
        wakeUp = resolve;
        retryTimer = setTimeout(resolve, retryDelay);
      });
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
    }
  };

  void loop();

  return () => {
    closed = true;
    clearTimeout(retryTimer);
    wakeUp?.(); // libera la espera de reintento para que el loop termine
    currentController?.abort();
  };
}
