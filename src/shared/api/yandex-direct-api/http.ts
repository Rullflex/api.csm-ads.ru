import type { YandexDirectApiError } from './types.js'
import axios from 'axios'

export const http = axios.create({
  baseURL: 'https://api-sandbox.direct.yandex.com/json/v501',
  headers: {
    'Authorization': `Bearer ${process.env.YANDEX_DIRECT_TOKEN}`,
    'Accept-Language': 'ru',
  },
  transformResponse: function transformResponse(data) {
    const response = JSON.parse(data)

    if (response.error) {
      throw new Error((response.error as YandexDirectApiError).error_detail)
    }

    return response.result
  },
})
