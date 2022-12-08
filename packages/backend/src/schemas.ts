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
  sendToItrade: {
    body: {
      type: 'object',
      required: [
        'index',
        'commo',
        'contract_twodigit',
        'contract',
        'extension',
        'freetext',
        'instrument',
        'price',
        'qty',
        'strategy',
      ],
      properties: {
        index: { type: 'number' },
        commo: { type: 'string' },
        contract_twodigit: { type: 'string' },
        contract: { type: 'string' },
        extension: { type: 'string' },
        freetext: { type: 'string' },
        instrument: { type: 'string' },
        price: { type: 'string' },
        qty: { type: 'number' },
        strategy: { type: 'string' },
      },
    },
  },
}

export default schemas
