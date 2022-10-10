import fastify from 'fastify'
import routes from './routes'
import cors from '@fastify/cors'

const server = fastify({
  logger: true,
})

// CORS
server.register(cors, {
  //
})

// Register Routes
routes.forEach((route) => server.route(route))

// Run the server!
server.listen(
  {
    host: (process.env.IRMS_BACKEND_HOST || '0.0.0.0') as string,
    port: (process.env.IRMS_BACKEND_PORT || 8000) as unknown as number,
  },
  function (error, address) {
    if (error) {
      server.log.error(error)
      process.exit(1)
    }
    server.log.info(`server listening on ${address}`)
  }
)
