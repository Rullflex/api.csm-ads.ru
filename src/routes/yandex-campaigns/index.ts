import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import qs from 'qs'
import { http, httpSt, YandexDirectApi } from '@/shared/api/yandex-direct-api/index.js'
import { normalizeValues } from '@/shared/utils/normalizeValues.js'
import { createCampaignsByBrowser } from '@/usecases/yandex-campaign/createCampaignsByBrowser.js'

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
    const { logins, campaigns } = normalizeValues(qs.parse(body, {
      strictDepth: true,
      throwOnLimitExceeded: true,
    }))

    req.log.info(campaigns, 'Полученные компании')
    return await createCampaignsByBrowser(logins, campaigns)
  })

  fastify.get('/agencyclients', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          st: { type: 'boolean', default: false },
        },
      },
    },
  }, async (req, _reply) => {
    const response = await YandexDirectApi(req.query.st ? httpSt : http).getAgencyClients({
      SelectionCriteria: {},
      FieldNames: ['ClientInfo', 'Login', 'ClientId'],
    })
    return response.data.Clients
  })
}

export default yandexCampaigns
