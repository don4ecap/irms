import createServer from './src'
import routes from './src/routes'
import { test } from 'tap'
import axios from 'axios'

// const _instanceOf = (val, type) => val?.constructor.name === type

const oldIRMS = axios.create({
  baseURL: 'http://10.153.64.31:8000/irms_compiled/DAL.ashx',
})

const COMMON_MESSAGES = {
  RETURNS_200: 'returns a status code of 200',
  RETURNS_404: 'returns a status code of 404',
  RETURNS_BODY_TYPE_ARRAY: 'returns correct response body type (array)',
  RETURNS_BODY_TYPE_OBJECT: 'returns correct response body type (object)',
  EQUAL_WITH_OLD_IRMS_API: 'equal with the old iRMS API',
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

      const oldAPIResponse = await oldIRMS.post('/', {
        id: 57,
        method: 'getbook',
        params: [tradeDate, account],
      })

      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      // @ts-ignore
      const responseBody = JSON.parse(resp.body)
      const oldAPIResponseBody = JSON.parse(oldAPIResponse.data.result)
      t.type(responseBody, 'Array', COMMON_MESSAGES.RETURNS_BODY_TYPE_ARRAY)
      t.equal(
        oldAPIResponseBody.length,
        responseBody.length,
        COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API + '(data length)'
      )
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
      const oldResp = await oldIRMS.post('', {
        id: 15,
        method: 'getportfolio',
        params: [tradeDate, account],
      })
      t.same(
        JSON.parse(oldResp.data.result)[0],
        JSON.parse(resp.body),
        COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API
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

      const oldIRMSResp = await oldIRMS.post('', {
        id: 18,
        method: 'checklastcalculated',
        params: [null],
      })
      const oldResponseBody = JSON.parse(oldIRMSResp.data.result)
      t.same(
        responseBody.value,
        oldResponseBody,
        COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API
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

      const oldAPIResp = await oldIRMS.post('', {
        id: 4,
        method: 'getstrategies',
        params: [],
      })

      const oldStrategies = JSON.parse(oldAPIResp.data.result)
      console.log('old strategies length:', oldStrategies.length)
      console.log('new strategies length:', responseBody.length)
      console.log(
        'length diff:',
        Math.max(oldStrategies.length, responseBody.length) -
          Math.min(oldStrategies.length, responseBody.length)
      )
      oldStrategies.forEach((oldStrategy) => {
        const exist = responseBody.indexOf(oldStrategy) > -1
        if (!exist) {
          console.log('Strategy', oldStrategy, "doesn't exist in the new iRMS")
        }
      })
      // t.same(
      //   responseBody,
      //   oldResponseBody,
      //   COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API
      // )
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

  /* -------------------------- TEST GET CONFIG TAGS -------------------------- */
  for (const account of accounts) {
    const url = `/api/get_configtags/${account}`
    await test(`Test '${url}'`, async function (t) {
      const oldAPIResp = await oldIRMS.post('/', {
        id: 55,
        method: 'getconfigtags',
        params: [account],
      })
      const resp = await server.inject({
        method: 'GET',
        url,
      })

      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      const responseBody = JSON.parse(resp.body)
      t.type(
        responseBody.constructor.name,
        'Array',
        COMMON_MESSAGES.RETURNS_BODY_TYPE_ARRAY
      )
      t.equal(
        responseBody.length,
        oldAPIResp.data.result.length,
        COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API + ' (data length)'
      )
      t.same(
        responseBody,
        oldAPIResp.data.result,
        COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API
      )
    })
  }

  /* ---------------------------- TEST GET WORKING ---------------------------- */
  for (const account of accounts) {
    const url = `/api/get_working/${account}/${tradeDate}`
    await test(`Test '${url}'`, async function (t) {
      // const oldAPIResp = await oldIRMS.post('/', {
      //   id: 1,
      //   method: 'getworking',
      //   params: [account, tradeDate],
      // })
      const resp = await server.inject({
        method: 'GET',
        url,
      })

      t.equal(resp.statusCode, 200, COMMON_MESSAGES.RETURNS_200)
      const responseBody = JSON.parse(resp.body)
      // const oldResponseBody = JSON.parse(oldAPIResp.data.result)
      t.type(
        responseBody.constructor.name,
        'Array',
        COMMON_MESSAGES.RETURNS_BODY_TYPE_ARRAY
      )
      // t.equal(
      //   responseBody.length,
      //   oldResponseBody.length,
      //   COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API + ' (data length)'
      // )
      // t.same(
      //   responseBody,
      //   oldResponseBody,
      //   COMMON_MESSAGES.EQUAL_WITH_OLD_IRMS_API
      // )
    })
  }

  await server.close().then(() => {
    process.exit(0)
  })
}

main()
