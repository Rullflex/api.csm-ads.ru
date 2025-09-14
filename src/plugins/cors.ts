import type { FastifySensibleOptions } from '@fastify/sensible'
import cors from '@fastify/cors'
import fp from 'fastify-plugin'

/**
 * This plugins enables the use of CORS in a Fastify application
 *
 * @see https://github.com/fastify/fastify-cors
 */
export default fp<FastifySensibleOptions>(async (fastify) => {
  fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, false)
        return
      }

      const hostname = new URL(origin).hostname
      if (hostname === 'localhost' || hostname.endsWith('csm-ads.ru')) {
        //  Request from localhost will pass
        cb(null, true)
        return
      }
      // Generate an error on other origins, disabling access
      cb(new Error('Not allowed'), false)
    },
  })
})
