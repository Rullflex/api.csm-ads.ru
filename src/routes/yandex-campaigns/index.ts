import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import type { Campaign } from '@/usecases/yandex-campaign/types.js'
import { createCampaignsByBrowser } from '@/usecases/yandex-campaign/createCampaignsByBrowser.js'
import { YandexDirectApi } from '../../shared/api/yandex-direct-api/index.js'

const yandexCampaigns: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _opts): Promise<void> => {
  fastify.post('/create', {
    schema: {
      body: {
        type: 'object',
        required: ['logins', 'campaigns'],
        properties: {
          logins: { type: 'array', items: { type: 'string' } },
          campaigns: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  }, async (req, _reply) => {
    return await createCampaignsByBrowser(req.body.logins, req.body.campaigns as unknown as Campaign[])
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
