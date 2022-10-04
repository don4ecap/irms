import { RouteOptions } from 'fastify'

const prefix = '/api'

const routes: Array<RouteOptions> = [
  {
    method: 'GET',
    url: `${prefix}/test`,
    async handler(req, res) {
      res.send({ message: 'hello world' })
    },
  },
]

export default routes
