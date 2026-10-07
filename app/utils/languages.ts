// Языки гида: API хранит коды (ru, en, …), в интерфейсе показываем названия
export const GUIDE_LANGUAGES = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'Английский' },
  { code: 'de', label: 'Немецкий' },
  { code: 'fr', label: 'Французский' },
  { code: 'es', label: 'Испанский' },
  { code: 'it', label: 'Итальянский' },
  { code: 'tr', label: 'Турецкий' },
  { code: 'zh', label: 'Китайский' },
]

// Неизвестный код показываем как есть
export function languageLabel(code: string) {
  return GUIDE_LANGUAGES.find(language => language.code === code)?.label ?? code
}
