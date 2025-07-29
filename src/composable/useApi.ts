import { useCookies } from '@vueuse/integrations/useCookies'
import { createFetch } from '@vueuse/core'

export const useMyFetch = createFetch({
  baseUrl: '/v1',
  combination: 'overwrite',

  options: {
    async beforeFetch({ options }) {
      const cookies = useCookies()
      if (cookies.get('token')) {
        options.headers = {
          ...options.headers,
          Authorization: 'bearer' + ' ' + cookies.get('token'),
        }
      }
      return { options }
    },
  },
})
