import type { FileUploadResponse } from '~/types/api'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024

export function useFiles() {
  const { $api } = useNuxtApp()

  // Возвращает публичный URL загруженного изображения
  async function uploadImage(file: File) {
    const body = new FormData()
    body.append('file', file)

    const response = await $api<FileUploadResponse>('/api/files', {
      method: 'POST',
      body
    })
    return response.url
  }

  return { uploadImage }
}
