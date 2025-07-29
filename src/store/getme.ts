import { defineStore } from 'pinia'
import { ref } from 'vue'

interface GetMe {
  id: number
  documentId: string
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt: Date
  locale: null
}

export const useGetMe = defineStore('getMe', () => {
  const getMe = ref<GetMe>()
  function setGetMe(value: GetMe) {
    getMe.value = value
  }
  function removeGetMe() {
    getMe.value = undefined
  }
  return { getMe, setGetMe, removeGetMe }
})
