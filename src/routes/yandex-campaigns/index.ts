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

    const parts = req.parts({ limits: { fieldNameSize: 1000, fileSize: 110 * 1024 * 1024, files: 7, parts: 10000 } })

    try {
      for await (const part of parts) {
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

      console.log(`[${new Date().toLocaleString('ru')}]`, JSON.stringify(parsedBody))

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
        required: ['login', 'password'],
        properties: {
          login: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (req, _reply) => {
    await authByBrowser(req.body)
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
