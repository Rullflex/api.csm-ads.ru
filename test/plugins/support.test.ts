import * as assert from 'node:assert'
import Fastify from 'fastify'
import Support from '../../src/plugins/support.js'

it('support works standalone', async (t) => {
  const fastify = Fastify()

  void fastify.register(Support)
  await fastify.ready()

  assert.equal(fastify.someSupport(), 'hugs')
})
