import type { FastifyMultipartOptions } from '@fastify/multipart'
import multipart from '@fastify/multipart'
import fp from 'fastify-plugin'

/**
 * @see https://github.com/fastify/fastify-multipart
 */
export default fp<FastifyMultipartOptions>(async (fastify) => {
  fastify.register(multipart)
})
