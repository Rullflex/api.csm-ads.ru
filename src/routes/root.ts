import type { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'

const root: FastifyPluginAsyncJsonSchemaToTs = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async (request, _reply) => {
    return { root: true, user: request.user }
  })

  fastify.post('/signup', {
    schema: { body: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } },
  }, async (req, reply) => {
    const { username, password } = req.body

    if (username === 'admin' && password === process.env.ADMIN_PASSWORD) {
      const token = fastify.jwt.sign({ user: 'Администратор' })
      return { token }
    }

    return reply.code(401).send({ error: 'Wrong credentials' })
  })
}

export default root
