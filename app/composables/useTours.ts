import type { Page, TourListItemResponse, TourSearchParams } from '~/types/api'

export function useTours() {
  const { $api } = useNuxtApp()

  function searchTours(params: TourSearchParams = {}) {
    return $api<Page<TourListItemResponse>>('/api/tours', { query: params })
  }

  return { searchTours }
}
