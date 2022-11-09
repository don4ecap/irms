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
  orderContracts: {
    body: {
      type: 'object',
      required: ['contract1', 'contract2', 'extension'],
      properties: {
        contract1: { type: 'string' },
        contract2: { type: 'string' },
        extension: { type: ['string', 'null'], nullable: true },
      },
    },
  },
}

export default schemas
