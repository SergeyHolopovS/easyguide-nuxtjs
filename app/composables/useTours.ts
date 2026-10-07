import type {
  CreateSlotsBulkRequest,
  CreateSlotsBulkResponse,
  Page,
  SlotsRangeParams,
  SlotViewResponse,
  TourDetailsResponse,
  TourListItemResponse,
  TourRequest,
  TourResponse,
  TourSearchParams
} from '~/types/api'

export function useTours() {
  const { $api } = useNuxtApp()

  async function searchTours(params: TourSearchParams = {}) {
    const page = await $api<Page<TourListItemResponse>>('/api/tours', { query: params })
    return { ...page, content: await withCovers(page.content) }
  }

  // В списках туров бэкенд не отдаёт обложку, поэтому догружаем её из карточки тура.
  // Если поле coverUrl появится в ответе списка, лишних запросов не будет
  function withCovers(tours: TourListItemResponse[]) {
    return Promise.all(tours.map(async (tour) => {
      if (tour.coverUrl !== undefined) return tour
      return { ...tour, coverUrl: await getCoverUrl(tour.id) }
    }))
  }

  // Обложка — первое фото по sortOrder; без фото или при ошибке карточка покажет заглушку
  async function getCoverUrl(tourId: string) {
    try {
      const tour = await getTour(tourId)
      return [...tour.photos].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? null
    } catch {
      return null
    }
  }

  function getTour(id: string) {
    return $api<TourDetailsResponse>(`/api/tours/${id}`)
  }

  // Все туры текущего гида во всех статусах
  function getMyTours() {
    return $api<TourResponse[]>('/api/my/tours')
  }

  // Убирает тур из каталога; вернуть можно через publishTour
  function archiveTour(id: string) {
    return $api<TourResponse>(`/api/tours/${id}/archive`, { method: 'POST' })
  }

  // Создаёт черновик (DRAFT); доступно только гидам
  function createTour(payload: TourRequest) {
    return $api<TourResponse>('/api/tours', { method: 'POST', body: payload })
  }

  // Полная замена полей: передаём все, включая неизменённые
  function updateTour(id: string, payload: TourRequest) {
    return $api<TourResponse>(`/api/tours/${id}`, { method: 'PUT', body: payload })
  }

  // Нужны описание от 50 символов, цена и хотя бы одно фото
  function publishTour(id: string) {
    return $api<TourResponse>(`/api/tours/${id}/publish`, { method: 'POST' })
  }

  // Не больше 10 фото; порядок — по очереди добавления, первое станет обложкой
  function addTourPhoto(id: string, url: string) {
    return $api<TourResponse>(`/api/tours/${id}/photos`, { method: 'POST', body: { url } })
  }

  function deleteTourPhoto(id: string, photoId: string) {
    return $api<TourResponse>(`/api/tours/${id}/photos/${photoId}`, { method: 'DELETE' })
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

  return { searchTours, withCovers, getTour, getMyTours, archiveTour, createTour, updateTour, publishTour, addTourPhoto, deleteTourPhoto, getSlots, createSlotsBulk, cancelSlot, deleteSlot }
}
