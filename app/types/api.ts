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

export type TourStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface TourPhotoResponse {
  id: string
  url: string
  sortOrder: number
}

export interface TourGuideResponse {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
}

export interface TourDetailsResponse {
  id: string
  title: string
  description: string
  city: string
  category: TourCategory
  meetingPoint: string
  // IANA, например Europe/Moscow: по нему считается местное время слотов
  timezone: string
  durationMinutes: number
  price: number | null
  maxPeople: number
  status: TourStatus
  rating: number | null
  reviewsCount: number
  photos: TourPhotoResponse[]
  guide: TourGuideResponse
}

export interface SlotViewResponse {
  id: string
  // Начало в UTC
  startsAt: string
  // Дата и время по местному времени тура: YYYY-MM-DD и HH:mm:ss
  localDate: string
  localTime: string
  capacity: number
  availableSeats: number
  // Не отменён, не начался и есть свободные места
  bookable: boolean
}

export interface SlotsRangeParams {
  // YYYY-MM-DD, включительно; диапазон не больше 92 дней
  from: string
  to: string
}

export interface CreateSlotsBulkRequest {
  dates: string[]
  // HH:mm:ss по часовому поясу тура
  times: string[]
  capacity?: number
}

export interface CreateSlotsBulkResponse {
  created: number
  skipped: number
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export interface CreateBookingRequest {
  slotId: string
  seats: number
  contactPhone: string
  comment?: string | null
}

export interface BookingResponse {
  id: string
  slotId: string
  userId: string
  seats: number
  totalPrice: number
  contactPhone: string | null
  comment: string | null
  status: BookingStatus
  cancelledBy: 'TOURIST' | 'GUIDE' | 'ADMIN' | null
  cancelReason: string | null
  createdAt: string
}

export interface BookingTourResponse {
  id: string
  title: string
  coverPhotoUrl: string | null
  city: string
}

export interface BookingSlotResponse {
  // Дата и время начала по местному времени тура: YYYY-MM-DD и HH:mm:ss
  date: string
  time: string
  timezone: string
}

export interface BookingCounterpartyResponse {
  id: string
  name: string
  avatarUrl: string | null
  phone: string | null
  email: string | null
}

export interface BookingListItemResponse {
  id: string
  tour: BookingTourResponse
  slot: BookingSlotResponse
  seats: number
  totalPrice: number
  status: BookingStatus
  comment: string | null
  // Для туриста — гид, для гида — турист
  counterparty: BookingCounterpartyResponse
}

export interface CancelBookingRequest {
  reason: string
}

export interface CreateReviewRequest {
  // 1–5
  rating: number
  text?: string | null
}

export interface ReviewResponse {
  id: string
  tourId: string
  authorId: string
  bookingId: string
  rating: number
  text: string | null
  createdAt: string
}
