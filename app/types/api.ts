// Типы по схеме EasyGuide API (http://localhost:8080/v3/api-docs)

export type ErrorStatus = 'NOT_FOUND' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'CONFLICT' | 'VALIDATION' | 'INTERNAL'

export interface ErrorDto {
  message: string
  status: ErrorStatus
  fields?: string[] | null
}

export interface UserResponse {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  bio: string | null
  city: string | null
  languages: string[]
  createdAt: string
  // В спецификации поле названо `guide`, но бэкенд фактически отдаёт `isGuide`
  isGuide: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string | null
}

// Частичное обновление: `null`/отсутствующие поля не меняются
export interface UpdateProfileRequest {
  name?: string | null
  phone?: string | null
  avatarUrl?: string | null
  bio?: string | null
  city?: string | null
  languages?: string[] | null
}

export interface FileUploadResponse {
  url: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserResponse
}

export type TourCategory = 'WALKING' | 'FOOD' | 'HISTORY' | 'NATURE' | 'ADVENTURE' | 'CULTURE' | 'NIGHTLIFE' | 'OTHER'

export interface TourListItemResponse {
  id: string
  title: string
  city: string
  category: TourCategory
  price: number | null
  durationMinutes: number
  rating: number | null
  reviewsCount: number
  // Обложка (первое фото по sortOrder). Пока бэкенд не отдаёт это поле в списке — запрошено
  coverUrl?: string | null
}

export interface TourSearchParams {
  city?: string
  category?: TourCategory
  priceMin?: number
  priceMax?: number
  // YYYY-MM-DD: только туры со свободными местами в этот день
  date?: string
  q?: string
  sort?: 'price' | 'rating'
  page?: number
  size?: number
}

// Постраничный ответ Spring Data (служебные поля pageable/sort опущены)
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}
