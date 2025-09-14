import type { FastifyJWTOptions } from '@fastify/jwt'
import jwt from '@fastify/jwt'
import fp from 'fastify-plugin'

/**
 * @see https://github.com/fastify/fastify-jwt
 */
export default fp<FastifyJWTOptions>(async (fastify) => {
  fastify.register(jwt, { secret: process.env.JWT_SECRET! })

  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.unauthorized('Auth token is invalid or missing')
    }
  })
})
