import type { FastifyFormbodyOptions } from '@fastify/formbody'
import formbody from '@fastify/formbody'
import fp from 'fastify-plugin'
import qs from 'qs'

/**
 * This plugins adds a content type parser for the content type application/x-www-form-urlencoded
 *
 * @see https://github.com/fastify/fastify-formbody
 */
export default fp<FastifyFormbodyOptions>(async (fastify) => {
  fastify.register(formbody, { parser: str => qs.parse(str) })
})
