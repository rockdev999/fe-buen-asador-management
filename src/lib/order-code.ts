/**
 * Código corto del pedido: primeros 8 caracteres del id en mayúsculas.
 * Es el mismo que el bot de WhatsApp le envía al cliente (#E0131C53), así
 * cliente y cajero hablan del mismo pedido.
 */
export const shortOrderId = (id: string) => id.slice(0, 8).toUpperCase();
