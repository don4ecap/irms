import { FastifyReply, FastifySchema, RouteOptions } from 'fastify'
import type {
  AccountOnlyParams,
  DeleteCommodityParams,
  DeleteSingleParams,
  CommonRequestParams,
  OrderContractsBody,
  SaveCellBody,
  GetConfigField,
  SendToITradeBody,
  GetRawConfigParams,
  GetBookQueries,
  GetAlarmsParams,
  CommonAlertData,
  UpdateAlertEnabledBody,
  UpdateAlertBody,
} from './types'
import type { ICMSCommissionsData, ICMSNavData } from 'irms-shared-types'
import type { UpdateICMSNavRequestBody } from 'irms-shared-types/REST'
import db from './db'
import schemas from './schemas'
import axios from 'axios'
import config from './config'
import helpers from './helpers'

const VALID_SESSIONS = ['eod', 'morning', 'afternoon', 'evening']

/** Function that takes a `FastifyReply` object and returns a function that handles internal server errors */
const internalServerErrorHandler = (res: FastifyReply) => (error: any) => {
  console.error(error)
  return res.status(500).send({ message: 'Internal server error' })
}

const routes: Array<RouteOptions> = [
  /* --------------------------------- GET NAV -------------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_nav/:account/:trade_date`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams

          const query = {
            sql: 'SELECT * FROM trading.tblfonav WHERE account=? AND td <= ? ORDER BY TIMESTAMP DESC LIMIT 1',
            params: [params.account, params.trade_date],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((rows) => {
              const nav = rows[0] || {}
              nav.last_nav_estimated = Boolean(nav?.last_nav_estimated)
              return res.send(nav)
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* -------------------------------- GET BOOK -------------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_book/:account/:trade_date`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams
          const queries = (req.query as GetBookQueries) || { session: '' }
          queries.session = (queries.session || '').toLowerCase()

          if (
            queries.session?.length &&
            !VALID_SESSIONS.includes(queries.session)
          ) {
            res.code(404).send({ message: 'invalid query value for `session`' })
          }

          if (queries.session === 'eod') {
            queries.session = ''
          }
          if (queries.session.length) {
            params.trade_date += '-' + queries.session
          }

          const query = {
            sql: 'SELECT * FROM trading.irms WHERE irms.account=? AND irms.td=? ORDER BY irms.orderNo, irms.year ASC, irms.month ASC',
            params: [params.account, params.trade_date],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((books: Array<any>) => {
              if (books.length) {
                books = books.map((book) => {
                  return {
                    ...book,
                    first_notice_date: helpers.toDateISOString(
                      book.first_notice_date
                    ),
                    last_trade_date: helpers.toDateISOString(
                      book.last_trade_date
                    ),
                    expiry4E: helpers.toDateISOString(book.expiry4E),
                    notice4E: helpers.toDateISOString(book.notice4E),

                    last_nav: helpers.properRound(book.last_nav),
                    live_nav: helpers.properRound(book.live_nav),
                  }
                })
                return res.send(books)
              } else {
                if (queries.session === '') {
                  queries.session = 'eod'
                }
                return res.status(404).send({
                  message: `account ${
                    params.account
                  } with ${queries.session.toUpperCase()} session has no books`,
                })
              }
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ------------------------------ GET PORTFOLIO ----------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_portfolio/:account/:trade_date`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams

          const query = { sql: '', params: [params.account, params.trade_date] }
          query.sql = `SELECT SUM(positions_pct_target) AS positions_pct_target, SUM(qty) AS qty, SUM(current_allocation_pct) AS current_allocation_pct, SUM(current_allocation_lots) AS current_allocation_lots, SUM(target_allocation_pct) AS target_allocation_pct, SUM(target_allocation_lots) AS target_allocation_lots, SUM(current_risks_pre) AS current_risks_pre, SUM(target_risks_pre) AS target_risks_pre FROM trading.irms WHERE account=? AND td=? AND rowtype='sector' AND instrument <> 'cash'`

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((rows) => res.send(rows[0] || {}))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* -------------------------- CHECK LAST CALCULATED ------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/check_last_calculated/:account`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: AccountOnlyParams = req.params as AccountOnlyParams

          const sqlQuery = `SELECT value FROM cacheDB.cache2 WHERE Name LIKE "irms_calculate_${params.account}" LIMIT 1`
          res.header('X-IRMS-SQL-QUERY', sqlQuery)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(sqlQuery)
            .then((rows) => res.send(rows[0] || { value: '' }))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ------------------------ GET COMMO INDICATOR LEVEL ----------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_commo_indicator_level`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const sqlQuery =
            'SELECT contract, maxLevel FROM customRef.execution_commoindicatormaxlevel_ees_live'
          res.header('X-IRMS-SQL-QUERY', sqlQuery)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(sqlQuery)
            .then((rows) => res.send(rows))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ----------------------------- GET STRATEGIES ----------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_strategies`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const sqlQuery = 'SELECT strategy_name FROM trading.ie_strategy'
          res.header('X-IRMS-SQL-QUERY', sqlQuery)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(sqlQuery)
            .then((strategies = []) =>
              res.send(
                strategies
                  .map((strategy: any) => strategy.strategy_name)
                  .concat(['MOC', 'CHECK', 'MOCPIT', 'MOCSPREAD'])
              )
            )
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* -------------------------------- SAVE CELL ------------------------------- */
  {
    method: 'POST',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/save_cell/:account/:trade_date`,
    schema: schemas.saveCell,
    handler(req, res) {
      const params: CommonRequestParams = req.params as CommonRequestParams
      const body: SaveCellBody = req.body as SaveCellBody

      const validateBodyRequest = req.compileValidationSchema(
        schemas.saveCell.body as FastifySchema
      )

      if (validateBodyRequest(req.body)) {
        db.pool
          .getConnection()
          .then((connection) => {
            const { account, trade_date } = params
            const { order_qty, order_p, contract, extension } = body

            const query = {
              sql: 'UPDATE trading.irms SET orderQ=?, orderP=? WHERE irms.account=? AND irms.contract=? AND irms.extension=? AND irms.td=?',
              params: [
                order_qty,
                order_p,
                account,
                contract,
                extension,
                trade_date,
              ],
            }
            res.header(
              'X-IRMS-SQL-QUERY',
              helpers.queryString(query.sql, query.params)
            )
            res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

            connection
              .query(query.sql, query.params)
              .then((result) =>
                res.send({
                  id: result.affectedRows ? body.id : -1,
                  result: result.query,
                })
              )
              .catch(internalServerErrorHandler(res))
              .finally(connection.end)
          })
          .catch(internalServerErrorHandler(res))
      }
    },
  },

  /* ------------------------------- GET WORKING ------------------------------ */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_working/:account/:trade_date`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams

          const query = {
            sql: "SELECT contract, extension, instrument, strategy, price FROM trading.tbltrading WHERE tbltrading.account=? AND tbltrading.cdate=? AND tbltrading.status NOT LIKE 'EXPIR%'",
            params: [params.account, params.trade_date],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((rows) => res.send(rows))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ---------------------------- DELETE ALL ORDERS --------------------------- */
  {
    method: 'DELETE',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/delete_all_orders/:account/:trade_date`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams

          // let query = `UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=?`
          const query = {
            sql: 'UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=?',
            params: [
              params.account,
              params.trade_date,
              // @ts-ignore
              req?.body?.sector || '',
            ],
          }

          // @ts-ignore
          if (req?.body?.sector) {
            query.sql += 'AND irms.sector=?'
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((result) => res.send({ updated: result.affectedRows >= 1 }))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* --------------------------- DELETE SINGLE ORDER -------------------------- */
  {
    method: 'DELETE',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/delete_single/:account/:trade_date/:contract/:extension`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: DeleteSingleParams = req.params as DeleteSingleParams

          const query = {
            sql: 'UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=? AND irms.contract=? AND irms.extension=?',
            params: [
              params.account,
              params.trade_date,
              params.contract,
              params.extension,
            ],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((result) => res.send({ updated: result.affectedRows >= 1 }))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ---------------------------- DELETE COMMODITY ---------------------------- */
  {
    method: 'DELETE',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/delete_commodity/:account/:trade_date/:commodity/:extension`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: DeleteCommodityParams =
            req.params as DeleteCommodityParams

          const query = {
            sql: 'UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=? AND irms.commo=? AND irms.extension=?',
            params: [
              params.account,
              params.trade_date,
              params.commodity,
              params.extension,
            ],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((result) => res.send({ deleted: result.affectedRows >= 1 }))
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* --------------------------- GET ORDER CONTRACTS -------------------------- */
  {
    method: 'POST',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/order_contracts`,
    schema: schemas.orderContracts,
    handler(req, res) {
      const body: OrderContractsBody = req.body as OrderContractsBody

      const validateBodyRequest = req.compileValidationSchema(
        schemas.orderContracts.body as FastifySchema
      )

      if (validateBodyRequest(req.body)) {
        db.pool
          .getConnection()
          .then((connection) => {
            const { contract1, contract2, extension } = body

            const query = {
              sql: '',
              params: [contract1, contract2],
            }

            if (extension !== 'Comdty') {
              query.sql =
                'SELECT contract_onedigit, contract_twodigit FROM trading.tbltradinguniverse WHERE contract_onedigit=? UNION SELECT contract_onedigit, contract_twodigit FROM trading.tbltradinguniverse WHERE contract_onedigit=?'
            } else {
              query.sql =
                'SELECT contract_onedigit, contract_twodigit FROM trading.tbltradinguniverse WHERE contract_onedigit IN (?, ?) ORDER BY year,month'
            }

            res.header(
              'X-IRMS-SQL-QUERY',
              helpers.queryString(query.sql, query.params)
            )
            res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

            connection
              .query(query, query.params)
              .then((rows) => res.send(rows || []))
              .catch(internalServerErrorHandler(res))
              .finally(connection.end)
          })
          .catch(internalServerErrorHandler(res))
      }
    },
  },

  /* ----------------------------- GET CONFIG TAGS ---------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_configtags/:account`,
    handler(req, res) {
      const { account } = req.params as AccountOnlyParams
      axios
        .get(
          `http://10.153.64.37:8080/bldb/schedulerAPI?method=strategyXML&strategy=${account}_DIR&contract=`
        )
        .then(({ data: configString }) => {
          const result = (configString.match(/\*\*\*\s?=\s?(\w*)/gs) || []).map(
            (tag: string) => tag.split('=')[1].trim()
          )
          return res.send(result)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ----------------------------- GET CONFIG FILE ---------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_raw_config/:account/:config_type`,
    handler(req, res) {
      const { account, config_type } = req.params as GetRawConfigParams
      const config = config_type === 'directional' ? 'DIR' : 'ID'

      axios
        .get(
          `http://10.153.64.37:8080/bldb/schedulerAPI?method=strategyXML&strategy=${account}_${config}&contract=`
        )
        .then(({ data: configString }) => {
          return res.send(configString)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ----------------------------- SEND TO ITRADE ----------------------------- */
  // TODO: AUTOMATED TESTING
  {
    method: 'POST',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/send_to_itrade/:account/:trade_date`,
    schema: schemas.sendToItrade,
    handler(req, res) {
      const params: CommonRequestParams = req.params as CommonRequestParams
      const body: SendToITradeBody = req.body as SendToITradeBody

      const validateBodyRequest = req.compileValidationSchema(
        schemas.sendToItrade.body as FastifySchema
      )

      if (validateBodyRequest(req.body)) {
        db.pool
          .getConnection()
          .then((connection) => {
            const { account, trade_date } = params
            const {
              index,
              commo,
              contract_twodigit,
              contract,
              extension,
              freetext,
              instrument,
              price,
              qty,
              strategy,
            } = body
            const tradeID = helpers.createUUID()

            const query = {
              sql: "INSERT INTO trading.tbltrading (tradeID, cdate, qty, contract, price, account, source, status, sendToBO, expiry, birth, freetext, strategy, contract_twodigit, commo, extension, instrument, via) VALUES(?, ?, ?, ?, ?, ?, 'ORDERS', 'NEW', 0, ?, ?, ?, ?, ?, ?, ?, ?, 'none')",
              params: [
                tradeID,
                trade_date,
                qty,
                contract,
                price,
                account,
                // ,
                // ,
                // ,
                helpers.getCurrentDate(),
                helpers.getCurrentDate(),
                freetext,
                strategy,
                contract_twodigit,
                commo,
                extension,
                instrument,
              ],
            }

            res.header(
              'X-IRMS-SQL-QUERY',
              helpers.queryString(query.sql, query.params)
            )
            res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

            connection
              .query(query.sql, query.params)
              .then((/* result */) => res.send({ result: index }))
              .catch(internalServerErrorHandler(res))
              .finally(connection.end)
          })
          .catch(internalServerErrorHandler(res))
      }
    },
  },

  /* ----------------------------- GET IRMS CONFIG ---------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_irms_config/:config_field_name`,
    handler(req, res) {
      const { config_field_name } = req.params as GetConfigField

      if (config_field_name === 'IRMS_DB_CONNECTIONSTRING') {
        return res.code(404).send({ message: 'Internal server error' })
      }

      try {
        const configField =
          config.getConfig(config_field_name).replace(/'|"/g, '') || ''
        return res.send({ content: configField })
      } catch (error) {
        return internalServerErrorHandler(res)(error)
      }
    },
  },

  /* ---------------------------- GET DB HOST INFO ---------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_db_info`,
    handler(req, res) {
      return res.send({
        DB_HOST: db.config.host,
        DB_PORT: db.config.port,
      })
    },
  },

  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_db_status`,
    async handler(req, res) {
      try {
        const connection = await db.pool.getConnection()
        try {
          await connection.query('SELECT 1 FROM trading.tbltrading LIMIT 1')
          const server = db.config.host
          return res.send({
            data: `Connection: OK, Server: ${server}, Database: trading`,
          })
        } catch (err) {
          internalServerErrorHandler(res)(err)
        } finally {
          connection?.end()
        }
      } catch (err) {
        internalServerErrorHandler(res)(err)
      }
    },
  },

  /* ----------------------------------- ### ---------------------------------- */
  /* --------------------------------- ALARMS --------------------------------- */
  /* ----------------------------------- ### ---------------------------------- */

  /* ------------------------------- GET ALARMS ------------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_alarms`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const query = {
            sql: `SELECT *, IF(CAST(currentValue AS FLOAT) <= CAST(alertLow AS FLOAT) OR CAST(currentValue AS FLOAT) >= CAST(alertHigh AS FLOAT), true, false) AS reached FROM customRef.mktdata_marketdataalarms`,
          }

          const { account } = req.query as { account: string | undefined }
          if (account) {
            query.sql += ` WHERE account="${account}"`
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql)
            .then((alarms) =>
              res.send(
                // @ts-ignore
                alarms.map((alarm) => ({
                  ...alarm,
                  enabled: alarm.enabled.toLowerCase() === 'true',
                  reached: Boolean(alarm.reached),
                }))
              )
            )
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ------------------------------- GET ALARMS ------------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/get_alarms/:account/:contract`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: GetAlarmsParams = req.params as GetAlarmsParams

          const query = {
            sql: `SELECT * FROM customRef.mktdata_marketdataalarms WHERE contract LIKE "${params.contract}%" AND account="${params.account}"`,
            // params: [params.contract],
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql)
            .then((alarms) =>
              res.send(
                // @ts-ignore
                alarms.map((alarm) => ({
                  ...alarm,
                  enabled: alarm.enabled.toLowerCase() === 'true',
                }))
              )
            )
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* -------------------------------- ADD ALARM ------------------------------- */
  {
    method: 'POST',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/add_alert`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { account, contract, field } = req.body as CommonAlertData

          // const contractSplited = contract.split(' ')
          // if (contractSplited.length < 2) {
          //   return res.code(422).send({
          //     success: false,
          //     message: 'Invalid contract',
          //   })
          // }

          // const [contract_, extension] = contractSplited
          // const contracts = await db.contracts.getContract(contract_, extension)
          // if (contracts?.length < 1) {
          //   return res.code(422).send({
          //     success: false,
          //     message: `Contract '${contract}' is not valid contract`,
          //   })
          // }

          const isAlarmExist = await db.alarms.isExist(account, contract, field)
          if (isAlarmExist) {
            return res.code(409).send({
              success: false,
              message: 'Alarm already exist',
            })
          }

          const query = {
            sql: `INSERT INTO customRef.mktdata_marketdataalarms (tablerownames, account, contract, field, alertLow, alertHigh, enabled, lowDirty, highDirty, numTriggers, currentValue) VALUES (1, ?, ?, ?, '', '', 'TRUE', 'FALSE', 'FALSE', 0, 0)`,
            params: [account, contract.toUpperCase(), field],
          }
          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          await connection
            .query(query.sql, query.params)
            .then(async () => {
              const addedAlarm = await db.alarms.getAlarm(
                contract.toUpperCase(),
                field
              )
              addedAlarm.enabled = addedAlarm.enabled.toLowerCase() === 'true'
              return res.send(addedAlarm)
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ------------------------------ DELETE ALARM ------------------------------ */
  {
    method: 'DELETE',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/delete_alert/:account/:contract/:field`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { account, contract, field } = req.params as CommonAlertData

          const query = {
            sql: `DELETE FROM customRef.mktdata_marketdataalarms WHERE account="${account}" AND contract="${contract.toUpperCase()}"  AND field="${field}"`,
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql)
            .then(async () => {
              return res.send({
                success: true,
                message: 'Successfully delete alarm',
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* -------------------------- UPDATE ENABLED ALARM -------------------------- */
  {
    method: 'PUT',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/update_enabled_alert/:account/:contract/:field`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { account, contract, field } = req.params as CommonAlertData
          const { enabled, numTriggers } = req.body as UpdateAlertEnabledBody
          const _enabled = enabled ? 'TRUE' : 'FALSE'

          const query = {
            sql: `UPDATE customRef.mktdata_marketdataalarms SET enabled="${_enabled}", numTriggers="${numTriggers}" WHERE account="${account}" contract="${contract}" AND field="${field}"`,
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          const isAlarmExist = await db.alarms.isExist(account, contract, field)
          if (!isAlarmExist) {
            return res.code(404).send({
              success: false,
              message: 'Alarm not exist',
            })
          }

          connection
            .query(query.sql)
            .then(async () => {
              return res.send({
                success: true,
                message: 'Successfully update enabled alarm',
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ------------------------------ UPDATE ALARM ------------------------------ */
  {
    method: 'PUT',
    url: `${config.IRMS_CONFIG.IRMS_API_BASE_PATH_PREFIX}/update_alert/:account/:contract/:field`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { account, contract, field } = req.params as CommonAlertData
          let { alertLow, alertHigh } = req.body as UpdateAlertBody

          // @ts-ignore
          // eslint-disable-next-line no-extra-boolean-cast
          alertLow = !!alertLow ? alertLow : null
          // @ts-ignore
          // eslint-disable-next-line no-extra-boolean-cast
          alertHigh = !!alertHigh ? alertHigh : null

          const isAlarmExist = await db.alarms.isExist(account, contract, field)
          if (!isAlarmExist) {
            return res.code(404).send({
              success: false,
              message: 'Alarm not exist',
            })
          }

          const query = {
            sql: 'UPDATE customRef.mktdata_marketdataalarms SET alertLow=?, alertHigh=? WHERE account=? AND contract=? AND field=?',
            params: [alertLow, alertHigh, account, contract, field],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then(async () => {
              return res.send({
                success: true,
                message: 'Successfully update icms alarm',
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ----------------------------------- ### ---------------------------------- */
  /* -------------------------------- ICMS APIs ------------------------------- */
  /* ----------------------------------- ### ---------------------------------- */

  /* ------------------------------ GET ICMS NAV ------------------------------ */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.ICMS_API_BASE_PATH_PREFIX}/get_navs/:account`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const { account } = req.params as AccountOnlyParams

          const query = {
            sql: 'SELECT * FROM trading.tblnav WHERE account=? ORDER BY date DESC',
            params: [account],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((navs: Array<ICMSNavData>) => {
              // Calculate daily perf
              for (let i = 0; i < navs.length - 1; i++) {
                const currentNav = navs[i]
                const prevNav = navs[i + 1]
                const perf =
                  (currentNav.pnl +
                    currentNav.brokerCommissions +
                    currentNav.misc) /
                  (prevNav.nav + prevNav.subred)
                currentNav.daily_perf = helpers.decimalRound(perf, 6)
              }
              res.send(navs)
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* ----------------------------- UPDATE ICMS NAV ---------------------------- */
  {
    method: 'PUT',
    url: `${config.IRMS_CONFIG.ICMS_API_BASE_PATH_PREFIX}/update_nav/:account/:trade_date`,
    schema: schemas.updateICMSNav,
    async handler(req, res) {
      try {
        const connection = await db.pool.getConnection()
        const { account, trade_date } = req.params as CommonRequestParams

        const existingICMSNav = await db.icms.getNav(account, trade_date)
        if (!existingICMSNav) {
          return res.code(404).send({
            success: false,
            message: 'Nav row does not exist',
          })
        }

        const updateICMSNavRequestBody = req.body as UpdateICMSNavRequestBody
        if (updateICMSNavRequestBody.nav === 0) {
          updateICMSNavRequestBody.nav = existingICMSNav.nav
        }

        let propagateMessage = ''
        if (updateICMSNavRequestBody.propagate) {
          const navDiff = updateICMSNavRequestBody.nav - existingICMSNav.nav
          const subRedDiff =
            updateICMSNavRequestBody.subred - existingICMSNav.nav
          const totalDiff = navDiff + subRedDiff
          const newerNavs = await db.icms.getNewerNavs(account, trade_date)
          if (newerNavs?.length) {
            const startDate = new Date(newerNavs[0].date)
              .toISOString()
              .slice(0, 10)
            const endDate = new Date(newerNavs[newerNavs.length - 1].date)
              .toISOString()
              .slice(0, 10)

            newerNavs.forEach(async (newerNav) => {
              await db.icms.updateNavField(
                account,
                trade_date,
                newerNav.nav + totalDiff
              )
            })
            propagateMessage = `NAV updated by $${totalDiff} between ${startDate} and ${endDate} (inclusive)`
          } else {
            propagateMessage = 'Nothing to propagate'
          }
        }
        const query = {
          sql: 'UPDATE trading.tblnav SET nav=?, fee1=?, fee2=?, fee3=?, fxAdj=?, comments=?, brokerCommissions=?, misc=?, subred=?, chNav=? WHERE account=? AND date=?',
          params: [
            updateICMSNavRequestBody.nav,
            updateICMSNavRequestBody.admin,
            updateICMSNavRequestBody.management,
            updateICMSNavRequestBody.incentive,
            updateICMSNavRequestBody.fxadj,
            updateICMSNavRequestBody.comments,
            updateICMSNavRequestBody.comissions,
            updateICMSNavRequestBody.misc,
            updateICMSNavRequestBody.subred,
            updateICMSNavRequestBody.adminnav,
            account,
            trade_date,
          ],
        }

        res.header(
          'X-IRMS-SQL-QUERY',
          helpers.queryString(query.sql, query.params)
        )
        res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

        await connection.query(query.sql, query.params)
        await connection.end()
        return res.send({
          success: true,
          message: `Nav upated for ${trade_date}\r\n${propagateMessage}\r\nRebased NAV recalculated for account ${account}\r\nClick OK to reload the table...`,
        })
      } catch (error) {
        internalServerErrorHandler(res)(error)
      }
    },
  },

  /* -------------------------- GET ICMS COMMISSIONS -------------------------- */
  {
    method: 'GET',
    url: `${config.IRMS_CONFIG.ICMS_API_BASE_PATH_PREFIX}/get_commissions/:account`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const { account } = req.params as AccountOnlyParams

          const query = {
            sql: 'SELECT * FROM tradingRef.tblTradingFees WHERE account=?',
            params: [account],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          connection
            .query(query.sql, query.params)
            .then((commissions) => {
              return res.send(commissions)
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* --------------------------- ADD COMMODITY FEES --------------------------- */
  {
    method: 'POST',
    url: `${config.IRMS_CONFIG.ICMS_API_BASE_PATH_PREFIX}/add_fees`,
    schema: schemas.addFees,
    async handler(req, res) {
      try {
        const body: ICMSCommissionsData = req.body as ICMSCommissionsData
        const validateBodyRequest = req.compileValidationSchema(
          schemas.addFees.body as FastifySchema
        )

        if (validateBodyRequest(req.body)) {
          const connection = await db.pool.getConnection()
          const {
            commodity,
            extension,
            instrument,
            account,
            sle,
            currency,
            viaVoice,
            viaGL,
            clearingOnly,
            phoneExcludingFees,
            dmaExcludingFees,
            exchangeFees,
          } = body

          const isFeesExist = await db.icms.isFeesExist(
            commodity,
            extension,
            instrument,
            account
          )

          if (isFeesExist) {
            return res.code(404).send({
              success: false,
              message: 'Fees exist',
            })
          }

          const query = {
            sql: 'INSERT INTO tradingRef.tblTradingFees(commodity, instrument, extension, account, sle, currency, viaVoice, viaGL, clearingOnly, phoneExcludingFees, dmaExcludingFees, exchangeFees) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            params: [
              commodity,
              instrument,
              extension,
              account,
              sle,
              currency,
              viaVoice,
              viaGL,
              clearingOnly,
              phoneExcludingFees,
              dmaExcludingFees,
              exchangeFees,
            ],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          const result = await connection.query(query.sql, query.params)
          if (result?.affectedRows) {
            res.send({
              success: true,
              message: 'Commodity fees has been added successfully',
            })
          }
          connection.end()
        }
      } catch (error) {
        internalServerErrorHandler(res)(error)
      }
    },
  },

  /* -------------------------- UPDATE COMMODITY FEES ------------------------- */
  {
    method: 'PUT',
    url: `${config.IRMS_CONFIG.ICMS_API_BASE_PATH_PREFIX}/update_fees`,
    schema: schemas.updateFees,
    async handler(req, res) {
      try {
        const body: ICMSCommissionsData = req.body as ICMSCommissionsData
        const validateBodyRequest = req.compileValidationSchema(
          schemas.updateFees.body as FastifySchema
        )

        if (validateBodyRequest(req.body)) {
          const connection = await db.pool.getConnection()
          const {
            commodity,
            extension,
            instrument,
            account,
            sle,
            currency,
            viaVoice,
            viaGL,
            clearingOnly,
            phoneExcludingFees,
            dmaExcludingFees,
            exchangeFees,
          } = body

          const isFeesExist = await db.icms.isFeesExist(
            commodity,
            extension,
            instrument,
            account
          )

          if (!isFeesExist) {
            return res.code(404).send({
              success: false,
              message: 'The fees not exist',
            })
          }

          const query = {
            sql: 'UPDATE tradingRef.tblTradingFees SET sle=?, currency=?, viaVoice=?, viaGL=?, clearingOnly=?, phoneExcludingFees=?, dmaExcludingFees=?, exchangeFees=? WHERE commodity=? AND extension=? AND instrument=? AND account=?',
            params: [
              sle,
              currency,
              viaVoice,
              viaGL,
              clearingOnly,
              phoneExcludingFees,
              dmaExcludingFees,
              exchangeFees,
              commodity,
              extension,
              instrument,
              account,
            ],
          }

          res.header(
            'X-IRMS-SQL-QUERY',
            helpers.queryString(query.sql, query.params)
          )
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          const result = await connection.query(query.sql, query.params)
          if (result?.affectedRows) {
            res.send({
              success: true,
              message: 'Commodity fees has been updated successfully',
            })
          }
          connection.end()
        }
      } catch (error) {
        internalServerErrorHandler(res)(error)
      }
    },
  },

  /* -------------------------- GET CONTRACTS -------------------------- */
  // {
  //   method: 'GET',
  //   url: `${config.IRMS_CONFIG. IRMS_API_BASE_PATH_PREFIX}/get_contracts`,
  //   handler(req, res) {
  //     db.pool
  //       .getConnection()
  //       .then((connection) => {
  //         const query = {
  //           sql: 'SELECT contract_twodigit, extension FROM tradingDB.contracts',
  //         }

  //         res.header('X-IRMS-SQL-QUERY', query.sql)
  //         res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

  //         connection
  //           .query(query.sql)
  //           .then((contracts) =>
  //             res.send(
  //               // @ts-ignore
  //               contracts.map((contract) => ({
  //                 ...contract,
  //                 contract_extension: `${contract.contract_twodigit} ${contract.extension}`,
  //               }))
  //             )
  //           )
  //           .catch(internalServerErrorHandler(res))
  //           .finally(connection.end)
  //       })
  //       .catch(internalServerErrorHandler(res))
  //   },
  // },

  // {
  //   method: 'GET',
  //   url: `${config.IRMS_CONFIG. IRMS_API_BASE_PATH_PREFIX}/test`,
  //   async handler(req, res) {
  //     res.send({ message: 'hello world' })
  //   },
  // },
]

export default routes
