import * as assert from 'node:assert'
import { it } from 'vitest'
import { build } from '../helper.js'

it('default root route', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/',
  })
  assert.deepStrictEqual(JSON.parse(res.payload), { root: true })
})
