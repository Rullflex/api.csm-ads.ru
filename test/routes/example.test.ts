import * as assert from 'node:assert'
import { it } from 'vitest'
import { build } from '../helper.js'

it('example is loaded', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/example',
  })

  assert.equal(res.payload, 'this is an example')
})
