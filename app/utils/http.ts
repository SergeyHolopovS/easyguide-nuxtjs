// Ошибка $fetch с ответом сервера (у сетевой ошибки statusCode нет)
export function isHttpError(error: unknown): error is { statusCode: number, data?: unknown } {
  return typeof error === 'object' && error !== null && typeof (error as { statusCode?: unknown }).statusCode === 'number'
}
