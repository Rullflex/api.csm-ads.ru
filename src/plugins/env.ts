import type { FastifyEnvOptions } from '@fastify/env'
import type { FromSchema, JSONSchema } from 'json-schema-to-ts'
import Env from '@fastify/env'
import fp from 'fastify-plugin'
// TODO заменить везде process.env на fastify.getEnvs()
const SCHEMA = {
  type: 'object',
  required: ['ADMIN_PASSWORD', 'JWT_SECRET', 'YANDEX_DIRECT_TOKEN', 'YANDEX_DIRECT_ST_TOKEN'],
  properties: {
    IS_SERVER: { type: 'boolean', default: false },

    ADMIN_PASSWORD: { type: 'string' },
    JWT_SECRET: { type: 'string' },

    YANDEX_DIRECT_TOKEN: { type: 'string' },
    YANDEX_DIRECT_ST_TOKEN: { type: 'string' },
  },
} as const satisfies JSONSchema

const CONFIG_KEY = 'config'

/**
 * @see https://github.com/fastify/fastify-env
 */
export default fp<FastifyEnvOptions>(async (fastify) => {
  fastify.register(Env, {
    dotenv: true,
    schema: SCHEMA,
    confKey: CONFIG_KEY,
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    [CONFIG_KEY]: FromSchema<typeof SCHEMA>
  }
}
