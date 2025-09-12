import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import { createWriteStream } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import qs from 'qs'
import { http, httpSt, YandexDirectApi } from '@/shared/api/yandex-direct-api/index.js'
import { normalizeValues } from '@/shared/utils/normalizeValues.js'
import { createCampaignsByBrowser } from '@/usecases/yandex-campaign/createCampaignsByBrowser.js'

const yandexCampaigns: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _opts): Promise<void> => {
  fastify.post('/create', async (req, _reply) => {
    const body = {} as Record<string, any>
    let tmpDir: string | null = null

    try {
      for await (const part of req.parts({ limits: { fileSize: 100 * 1024 * 1024 } })) {
        if (part.type === 'file') {
          if (!tmpDir) {
            tmpDir = await mkdtemp(path.join(os.tmpdir(), 'yc-uploads-'))
          }

          const filePath = path.join(tmpDir, part.filename)
          await pipeline(part.file, createWriteStream(filePath))
          body[part.fieldname] = part.filename
        } else {
          body[part.fieldname] = part.value
        }
      }

      // parse qs and normalize values to corresponding types
      const { logins, campaigns } = normalizeValues(qs.parse(body, {
        strictDepth: true,
        throwOnLimitExceeded: true,
      }))

      req.log.info(campaigns, 'Полученные компании')
      return await createCampaignsByBrowser(logins, campaigns)
    } finally {
      if (tmpDir) {
        await rm(tmpDir, { recursive: true, force: true })
      }
    }
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
