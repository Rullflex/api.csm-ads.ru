import type { GetAgencyClientsRequest, GetAgencyClientsResponse } from './types.js'
import { http } from './http.js'

export const YandexDirectApi = {
  getAgencyClients: (params: GetAgencyClientsRequest['params']) => {
    return http.post<GetAgencyClientsResponse>('/agencyclients', {
      method: 'get',
      params,
    })
  },
}
