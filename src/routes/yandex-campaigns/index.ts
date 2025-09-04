import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import type { Campaign } from '@/usecases/yandex-campaign/types.js'
import qs from 'qs'
import { normalizeValues } from '@/shared/utils/normalizeValues.js'
import { createCampaignsByBrowser } from '@/usecases/yandex-campaign/createCampaignsByBrowser.js'
import { YandexDirectApi } from '../../shared/api/yandex-direct-api/index.js'

const yandexCampaigns: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _opts): Promise<void> => {
  fastify.post('/create', async (req, _reply) => {
    const { campaigns } = normalizeValues(qs.parse(req.body as string, {
      strictDepth: true,
      throwOnLimitExceeded: true,
    })) // TODO - get logins

    req.log.info(campaigns, 'Полученные компании')
    return await createCampaignsByBrowser(['e-17155838'] as string[], campaigns as unknown as Campaign[])
  })

  fastify.get('/agencyclients', async (_request, _reply) => {
    const response = await YandexDirectApi.getAgencyClients({
      SelectionCriteria: {},
      FieldNames: ['ClientInfo', 'Login', 'ClientId'],
    })
    return response.data.Clients
  })
}

export default yandexCampaigns
