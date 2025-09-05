import type { YandexDirectApiError } from './types.js'
import axios from 'axios'

export const http = createDirectInstance({ token: process.env.YANDEX_DIRECT_TOKEN! })
export const httpSt = createDirectInstance({ token: process.env.YANDEX_DIRECT_ST_TOKEN! })

function createDirectInstance({ token }: { token: string }) {
  return axios.create({
    baseURL: 'https://api.direct.yandex.com/json/v501',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': 'ru',
    },
    transformResponse: function transformResponse(data) {
      const response = JSON.parse(data)

      if (response.error) {
        throw new Error(`[Yandex Direct API] ${(response.error as YandexDirectApiError).error_detail}`)
      }

      return response.result
    },
  })
}
