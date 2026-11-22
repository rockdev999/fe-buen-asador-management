import { httpClient } from "@/services/http.client";
import { ReportParams } from "../dto/report.dto";

export type PdfReport = "sales" | "expenses" | "payroll" | "ingredients" | "summary";

export interface PdfReportParams extends ReportParams {
  /** Por defecto true; con false se omiten las listas de gastos y nómina. */
  detail?: boolean;
}

/** Un PDF de un año con detalle puede tardar más que el timeout normal. */
const PDF_TIMEOUT_MS = 90_000;

/** No envía undefined; detail solo cuando es false (por defecto es true). */
function toQueryParams(f: PdfReportParams) {
  const p: Record<string, string> = { dateFrom: f.dateFrom, dateTo: f.dateTo };
  if (f.locationId) p.locationId = f.locationId;
  if (f.detail === false) p.detail = "false";
  return p;
}

export function pdfFilename(type: PdfReport, f: ReportParams, header?: string) {
  return (
    /filename="?([^";]+)"?/.exec(header ?? "")?.[1] ??
    `reporte-${type}_${f.dateFrom}_${f.dateTo}.pdf`
  );
}

/**
 * Descarga el PDF. Los errores (JSON aunque se pida un archivo) los decodifica
 * y notifica el interceptor; aquí solo se propaga el rechazo.
 */
export async function downloadReportPdf(type: PdfReport, filters: PdfReportParams) {
  const res = await httpClient.get<Blob>(`/finances/reports/${type}/pdf`, {
    params: toQueryParams(filters),
    responseType: "blob",
    headers: { Accept: "application/pdf, application/json" },
    timeout: PDF_TIMEOUT_MS,
  });
  saveBlob(
    res.data,
    pdfFilename(type, filters, res.headers["content-disposition"] as string | undefined),
  );
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
