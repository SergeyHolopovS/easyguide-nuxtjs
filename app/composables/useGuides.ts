import type { GuideProfileResponse } from '~/types/api'

export function useGuides() {
  const { $api } = useNuxtApp()

  // Публичный профиль гида с его опубликованными турами; доступен без входа
  function getGuideProfile(id: string) {
    return $api<GuideProfileResponse>(`/api/users/${id}`)
  }

  return { getGuideProfile }
}
