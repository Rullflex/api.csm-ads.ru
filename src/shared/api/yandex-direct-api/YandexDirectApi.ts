import type { AxiosInstance } from 'axios'
import type { GetAgencyClientsRequest, GetAgencyClientsResponse } from './types.js'

export function YandexDirectApi(http: AxiosInstance) {
  return {
    getAgencyClients: (params: GetAgencyClientsRequest['params']) => {
      return http.post<GetAgencyClientsResponse>('/agencyclients', {
        method: 'get',
        params,
      })
    },
  }
}
