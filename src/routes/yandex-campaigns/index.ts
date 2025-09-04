import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import type { Campaign } from '@/usecases/yandex-campaign/types.js'
import qs from 'qs'
import { normalizeValues } from '@/shared/utils/normalizeValues.js'
import { createCampaignsByBrowser } from '@/usecases/yandex-campaign/createCampaignsByBrowser.js'
import { YandexDirectApi } from '../../shared/api/yandex-direct-api/index.js'

const yandexCampaigns: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _opts): Promise<void> => {
  fastify.post('/create', async (req, _reply) => {
    const files = await req.saveRequestFiles({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    })

    // keyValues + remove files
    const body = Object.entries(files[0].fields).reduce((acc, [key, field]) => {
      if (!field || Array.isArray(field))
        return acc

      return {
        ...acc,
        [key]: field.type === 'file' ? field.filename : field.value,
      }
    }, {})

    // parse qs and normalize values to corresponding types
    const { campaigns } = normalizeValues(qs.parse(body, {
      strictDepth: true,
      throwOnLimitExceeded: true,
    })) // TODO - get and pass real logins

    req.log.info(campaigns, 'Полученные компании')
    return await createCampaignsByBrowser(['e-17155838'] as string[], campaigns as Campaign[])
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
