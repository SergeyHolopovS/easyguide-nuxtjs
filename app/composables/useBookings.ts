import type {
  BookingListItemResponse,
  BookingResponse,
  BookingStatus,
  CreateBookingRequest,
  CreateReviewRequest,
  Page,
  ReviewResponse
} from '~/types/api'

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

  return { createBooking, getMyBookings, cancelBooking, createReview }
}
