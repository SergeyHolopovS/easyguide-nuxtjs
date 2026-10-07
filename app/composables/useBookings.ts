import type {
  BookingListItemResponse,
  BookingResponse,
  BookingStatus,
  CreateBookingRequest,
  CreateReviewRequest,
  Page,
  ReviewResponse
} from '~/types/api'

export const PENDING_COUNT_KEY = 'guide-pending-count'

export function useBookings() {
  const { $api } = useNuxtApp()

  // Бронь создаётся в статусе PENDING и ждёт подтверждения гида
  function createBooking(payload: CreateBookingRequest) {
    return $api<BookingResponse>('/api/bookings', {
      method: 'POST',
      body: payload
    })
  }

  // Брони текущего пользователя как туриста, по 20 на странице
  function getMyBookings(params: { status?: BookingStatus, page?: number } = {}) {
    return $api<Page<BookingListItemResponse>>('/api/my/bookings', { query: params })
  }

  // Брони туристов на туры текущего гида, по 20 на странице; counterparty — турист
  function getGuideBookings(params: { status?: BookingStatus, page?: number } = {}) {
    return $api<Page<BookingListItemResponse>>('/api/my/guide-bookings', { query: params })
  }

  // Гид подтверждает заявку: PENDING → CONFIRMED
  function confirmBooking(id: string) {
    return $api<BookingResponse>(`/api/bookings/${id}/confirm`, { method: 'POST' })
  }

  // Гид отклоняет заявку: PENDING → REJECTED, места возвращаются в слот
  function rejectBooking(id: string) {
    return $api<BookingResponse>(`/api/bookings/${id}/reject`, { method: 'POST' })
  }

  // Число заявок, ждущих решения гида: общий ключ для шапки и страницы заявок.
  // Не гиду не запрашиваем; перезагружается, когда пользователь становится гидом или выходит
  function loadPendingCount() {
    const { user } = useAuthSession()
    return useAsyncData(PENDING_COUNT_KEY, () => user.value?.isGuide
      ? getGuideBookings({ status: 'PENDING' }).then(page => page.totalElements).catch(() => null)
      : Promise.resolve(null), { watch: [() => user.value?.isGuide] })
  }

  // Возможна для PENDING и CONFIRMED до начала слота
  function cancelBooking(id: string, reason: string) {
    return $api<BookingResponse>(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      body: { reason }
    })
  }

  // Один отзыв на завершённую (COMPLETED) бронь
  function createReview(bookingId: string, payload: CreateReviewRequest) {
    return $api<ReviewResponse>(`/api/bookings/${bookingId}/review`, {
      method: 'POST',
      body: payload
    })
  }

  return { createBooking, getMyBookings, getGuideBookings, confirmBooking, rejectBooking, loadPendingCount, cancelBooking, createReview }
}
