// Превращает путь от бэкенда (например, /uploads/a.png) в полный URL на apiBase.
// Абсолютные URL, data: и blob: возвращаются без изменений
export function useApiUrl() {
  const config = useRuntimeConfig()

  return (path: string | null | undefined) => {
    if (!path) return undefined
    return new URL(path, config.public.apiBase).href
  }
}
