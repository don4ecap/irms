import createServer from './src'
import routes from './src/routes'
import { test } from 'tap'

// const _instanceOf = (val, type) => val?.constructor.name === type

const COMMON_MESSAGES = {
  RETURNS_200: 'returns a status code of 200',
  RETURNS_404: 'returns a status code of 404',
  RETURNS_BODY_TYPE_ARRAY: 'returns correct response body type (array)',
  RETURNS_BODY_TYPE_OBJECT: 'returns correct response body type (object)',
}

async function main() {
  const server = await createServer({
    logger: false,
    disableRequestLogging: true,
  })

  routes.forEach((route) => server.route(route))
  const tradeDate = new Date().toISOString().split('T').at(0)
  const accounts = ['EE02', 'EE04', 'KRMS']

  /* ------------------------------ TEST GET BOOK ----------------------------- */
  for (const i in accounts) {
    const account = accounts[i]
    const url = `/api/get_book/${account}/${tradeDate}`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      // @ts-ignore
      const responseBody = JSON.parse(resp.body)
      t.type(responseBody, 'Array', COMMON_MESSAGES.RETURNS_BODY_TYPE_ARRAY)
    })
  }

  /* ------------------------------ TEST GET NAV ------------------------------ */
  for (const i in accounts) {
    const account = accounts[i]
    const url = `/api/get_nav/${account}/${tradeDate}`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      const responseBody = JSON.parse(resp.body)
      t.type(responseBody, 'Object', COMMON_MESSAGES.RETURNS_BODY_TYPE_OBJECT)
    })
  }

  /* --------------------------- TEST GET PORTFOLIO --------------------------- */
  for (const i in accounts) {
    const account = accounts[i]
    const url = `/api/get_portfolio/${account}/${tradeDate}`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      t.type(
        JSON.parse(resp.body),
        'Object',
        COMMON_MESSAGES.RETURNS_BODY_TYPE_OBJECT
      )
    })
  }

  /* --------------------- TEST GET CHECK LAST CALCULATED --------------------- */
  for (const i in accounts) {
    const account = accounts[i]
    const url = `/api/check_last_calculated/${account}`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      const responseBody = JSON.parse(resp.body)
      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      t.type(responseBody, 'Object', COMMON_MESSAGES.RETURNS_BODY_TYPE_OBJECT)
      t.hasProp(responseBody, 'value', 'should have the `value` property')
      t.type(
        new Date(responseBody.value),
        Date,
        '`value` is a valid `Date` type'
      )
    })
  }

  /* ------------------------ GET COMMO INDICATOR LEVEL ----------------------- */
  {
    const url = `/api/get_commo_indicator_level`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      const responseBody = JSON.parse(resp.body)
      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      t.equal(
        responseBody.constructor.name,
        'Array',
        COMMON_MESSAGES.RETURNS_BODY_TYPE_ARRAY
      )
    })
  }

  /* --------------------------- TEST GET STRATEGIES -------------------------- */
  {
    const url = `/api/get_strategies`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      const responseBody = JSON.parse(resp.body)
      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      t.equal(
        responseBody.constructor.name,
        'Array',
        COMMON_MESSAGES.RETURNS_BODY_TYPE_ARRAY
      )
    })
  }

  /* -------------------------- TEST GET CONFIG FIELD ------------------------- */
  /* ------------------------ TEST VALID CONFIG FIELDS ------------------------ */
  const validConfigFields = ['ORDER_GENERATION_CODE']
  for (const configField of validConfigFields) {
    const url = `/api/get_irms_config/${configField}`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      const responseBody = JSON.parse(resp.body)
      // console.log(responseBody)

      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      t.type(responseBody, 'Object', COMMON_MESSAGES.RETURNS_BODY_TYPE_OBJECT)
      t.hasProp(responseBody, 'content', 'should have the `content` property')
    })
  }
  /* ----------------------- TEST INVALID CONFIG FIELDS ----------------------- */
  const invalidConfigFields = ['IRMS_DB_CONNECTIONSTRING']
  for (const configField of invalidConfigFields) {
    const url = `/api/get_irms_config/${configField}`
    await test(`Test '${url}'`, async function (t) {
      const resp = await server.inject({
        method: 'GET',
        url,
      })
      const responseBody = JSON.parse(resp.body)
      t.equal(resp.statusCode, 404, COMMON_MESSAGES.RETURNS_404)
      t.type(responseBody, 'Object', COMMON_MESSAGES.RETURNS_BODY_TYPE_OBJECT)
      t.hasProp(responseBody, 'message', 'should have the `message` property')
    })
  }

  /* --------------------------- TEST GET RAW CONFIG -------------------------- */
  for (const account of accounts) {
    for (const config of ['directional', 'intraday']) {
      const url = `/api/get_raw_config/${account}/${config}`
      await test(`Test '${url}'`, async function (t) {
        const resp = await server.inject({
          method: 'GET',
          url,
        })
        t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      })
    }
  }

  //

  await server.close().then(() => {
    process.exit(0)
  })
}

main()
