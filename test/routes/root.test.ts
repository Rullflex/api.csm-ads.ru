import assert from 'node:assert'
import { test } from 'node:test'
import { build } from '../helper.js'

// TODO - use vitest https://github.com/vitest-dev/vitest/tree/main/examples/fastify
test('default root route', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/',
  })
  assert.deepStrictEqual(JSON.parse(res.payload), { root: true })
})
