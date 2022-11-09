import { FastifySchema } from 'fastify'

interface ValidationSchemas {
  [key: string]: FastifySchema
}

const schemas: ValidationSchemas = {
  saveCell: {
    body: {
      type: 'object',
      required: ['id', 'contract', 'extension', 'order_qty', 'order_p'],
      properties: {
        id: { type: 'number' },
        contract: { type: 'string' },
        extension: { type: 'string' },
        order_qty: { type: ['string', 'null'] },
        order_p: { type: ['string', 'null'] },
      },
    },
  },
}

export default schemas
