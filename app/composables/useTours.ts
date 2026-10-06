import type {
  CreateSlotsBulkRequest,
  CreateSlotsBulkResponse,
  Page,
  SlotsRangeParams,
  SlotViewResponse,
  TourDetailsResponse,
  TourListItemResponse,
  TourSearchParams
} from '~/types/api'

export function useTours() {
  const { $api } = useNuxtApp()

  function searchTours(params: TourSearchParams = {}) {
    return $api<Page<TourListItemResponse>>('/api/tours', { query: params })
  }

  function getTour(id: string) {
    return $api<TourDetailsResponse>(`/api/tours/${id}`)
  }

  function getSlots(tourId: string, range: SlotsRangeParams) {
    return $api<SlotViewResponse[]>(`/api/tours/${tourId}/slots`, { query: range })
  }

  // Создаёт слоты для всех комбинаций «дата × время»; существующие пропускаются
  function createSlotsBulk(tourId: string, payload: CreateSlotsBulkRequest) {
    return $api<CreateSlotsBulkResponse>(`/api/tours/${tourId}/slots/bulk`, {
      method: 'POST',
      body: payload
    })
  }

  // Отмена слота отменяет и все его активные брони
  function cancelSlot(slotId: string) {
    return $api(`/api/slots/${slotId}/cancel`, { method: 'POST' })
  }

  // Удалить можно только слот без активных броней
  function deleteSlot(slotId: string) {
    return $api(`/api/slots/${slotId}`, { method: 'DELETE' })
  }

  return { searchTours, getTour, getSlots, createSlotsBulk, cancelSlot, deleteSlot }
}
