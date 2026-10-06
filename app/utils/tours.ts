import type { TourCategory } from '~/types/api'

export const CATEGORY_LABELS: Record<TourCategory, string> = {
  WALKING: 'Пешие экскурсии',
  FOOD: 'Гастрономические туры',
  HISTORY: 'История',
  NATURE: 'Природа',
  ADVENTURE: 'Приключения',
  CULTURE: 'Культура и искусство',
  NIGHTLIFE: 'Ночная жизнь',
  OTHER: 'Другое'
}
