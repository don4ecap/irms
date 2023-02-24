import fastify, { FastifyServerOptions } from 'fastify'
import routes from './routes'
import cors from '@fastify/cors'
import db from './db'

const createServer = (opts: FastifyServerOptions) => fastify(opts)

const server = createServer({
  logger: true,
})

// CORS plugin
server.register(cors, {
  // specifying a list of headers to expose
  exposedHeaders: [
    'X-IRMS-DB-HOST',
    'X-IRMS-DB-PORT',
    'X-IRMS-SQL-QUERY',
    'X-IRMS-TIMESTAMP',
  ],
})

// Add an "onSend" hook to the server, which is called just before the response is sent to the client
server.addHook('onSend', (req, res, payload, next) => {
  // Add the X-IRMS-DB-HOST and X-IRMS-DB-PORT headers to the response
  res.header('X-IRMS-DB-HOST', db.config.host)
  res.header('X-IRMS-DB-PORT', db.config.port)

  // Call the "next" callback to continue processing the request/response cycle
  next()
})

// Set an error handler for the server, which is called when an unhandled error occurs during request processing
server.setErrorHandler((error, req, res) => {
  // Add the X-IRMS-DB-HOST and X-IRMS-DB-PORT headers to the response
  res.header('X-IRMS-DB-HOST', db.config.host)
  res.header('X-IRMS-DB-PORT', db.config.port)

  // Send an error response to the client, with the error message and status code
  res.send({
    message: error.message,
    status: error.statusCode || 500,
  })
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

export default createServer
