import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import { createWriteStream } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import qs from 'qs'
import { http, httpSt, YandexDirectApi } from '@/shared/api/yandex-direct-api/index.js'
import { normalizeValues } from '@/shared/utils/normalizeValues.js'
import { authByBrowser } from '@/usecases/yandex-campaign/authByBrowser.js'
import { createCampaignsByBrowser } from '@/usecases/yandex-campaign/createCampaignsByBrowser.js'

const yandexCampaigns: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _opts): Promise<void> => {
  fastify.post('/create', async (req, _reply) => {
    const fields: [string, string][] = []
    let tmpDir: string | null = null

    try {
      for await (const part of req.parts({ limits: { fileSize: 100 * 1024 * 1024 } })) {
        if (part.type === 'file') {
          if (!tmpDir) {
            tmpDir = await mkdtemp(path.join(os.tmpdir(), 'yc-uploads-'))
          }

          const filePath = path.join(tmpDir, part.filename)
          await pipeline(part.file, createWriteStream(filePath))
          fields.push([part.fieldname, filePath])
        } else {
          fields.push([part.fieldname, part.value as string])
        }
      }

      const queryString = fields
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')

      // parse qs and normalize values to corresponding types
      const parsedBody = normalizeValues(qs.parse(queryString, {
        strictDepth: true,
        throwOnLimitExceeded: true,
      }))

      req.log.info(parsedBody)

      const { logins, campaigns, isStAgency } = parsedBody
      return await createCampaignsByBrowser(logins, campaigns, isStAgency)
    } finally {
      if (tmpDir) {
        await rm(tmpDir, { recursive: true, force: true })
      }
    }
  })

  fastify.post('/auth', {
    schema: {
      body: {
        type: 'object',
        properties: {
          isStAgency: { type: 'boolean', default: false },
        },
      },
    },
  }, async (req, _reply) => {
    await authByBrowser(req.body.isStAgency)
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
