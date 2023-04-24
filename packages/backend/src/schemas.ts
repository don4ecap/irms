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
  updateICMSNav: {
    body: {
      type: 'object',
      required: [
        'admin',
        'adminnav',
        'comissions',
        'comments',
        'fxadj',
        'incentive',
        'management',
        'misc',
        'nav',
        'pnl',
        'propagate',
        'subred',
      ],
      properties: {
        admin: { type: 'number' },
        adminnav: { type: 'number' },
        comissions: { type: 'number' },
        comments: { type: 'string' },
        fxadj: { type: 'number' },
        incentive: { type: 'number' },
        management: { type: 'number' },
        misc: { type: 'number' },
        nav: { type: 'number' },
        pnl: { type: 'number' },
        propagate: { type: 'number' },
        subred: { type: 'number' },
      },
    },
  },
  addFees: {
    body: {
      type: 'object',
      required: [
        'commodity',
        'extension',
        'instrument',
        'account',
        'sle',
        'currency',
        'viaVoice',
        'viaGL',
        'clearingOnly',
        'phoneExcludingFees',
        'dmaExcludingFees',
        'exchangeFees',
        'phoneIncludingFees',
        'dmaIncludingFees',
      ],
      properties: {
        commodity: { type: 'string' },
        extension: { type: 'string' },
        instrument: { type: 'string' },
        account: { type: 'string' },
        sle: { type: 'string' },
        currency: { type: 'string' },
        viaVoice: { type: 'number' },
        viaGL: { type: 'number' },
        clearingOnly: { type: 'number' },
        phoneExcludingFees: { type: 'number' },
        dmaExcludingFees: { type: 'number' },
        exchangeFees: { type: 'number' },
        phoneIncludingFees: { type: 'number' },
        dmaIncludingFees: { type: 'number' },
        effectiveDate: { type: ['null', 'string'] },
      },
      additionalProperties: false,
    },
  },
}

export default schemas
