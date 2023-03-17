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
import db from './db'
import schemas from './schemas'
import axios from 'axios'
import config from './config'
import helpers from './helpers'

const prefix = '/api'
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
    url: `${prefix}/get_nav/:account/:trade_date`,
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
    url: `${prefix}/get_book/:account/:trade_date`,
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
    url: `${prefix}/get_portfolio/:account/:trade_date`,
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
    url: `${prefix}/check_last_calculated/:account`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: AccountOnlyParams = req.params as AccountOnlyParams

          const sqlQuery = `SELECT value FROM cacheDB.cache2 WHERE Name LIKE 'irms_calculate_${params.account}' LIMIT 1`
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
    url: `${prefix}/get_commo_indicator_level`,
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
    url: `${prefix}/get_strategies`,
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
    url: `${prefix}/save_cell/:account/:trade_date`,
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
    url: `${prefix}/get_working/:account/:trade_date`,
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
    url: `${prefix}/delete_all_orders/:account/:trade_date`,
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
    url: `${prefix}/delete_single/:account/:trade_date/:contract/:extension`,
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
    url: `${prefix}/delete_commodity/:account/:trade_date/:commodity/:extension`,
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
    url: `${prefix}/order_contracts`,
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
    url: `${prefix}/get_configtags/:account`,
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
    url: `${prefix}/get_raw_config/:account/:config_type`,
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
    url: `${prefix}/send_to_itrade/:account/:trade_date`,
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
    url: `${prefix}/get_irms_config/:config_field_name`,
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
    url: `${prefix}/get_db_info`,
    handler(req, res) {
      return res.send({
        DB_HOST: db.config.host,
        DB_PORT: db.config.port,
      })
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_db_status`,
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

  {
    method: 'GET',
    url: `${prefix}/get_alarms`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const query = {
            sql: `SELECT * FROM customRef.mktdata_marketdataalarms`,
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

  /* ------------------------------- GET ALARMS ------------------------------- */
  {
    method: 'GET',
    url: `${prefix}/get_alarms/:contract`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then((connection) => {
          const params: GetAlarmsParams = req.params as GetAlarmsParams

          const query = {
            sql: `SELECT * FROM customRef.mktdata_marketdataalarms WHERE contract LIKE '${helpers.sqlEscape(
              params.contract
            )}%'`,
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
    url: `${prefix}/add_alert`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { contract, field } = req.body as CommonAlertData

          const contractSplited = contract.split(' ')
          if (contractSplited.length < 2) {
            return res.code(422).send({
              success: false,
              message: 'Invalid contract',
            })
          }

          const [contract_, extension] = contractSplited
          const contracts = await db.contracts.getContract(contract_, extension)
          if (contracts?.length < 1) {
            return res.code(422).send({
              success: false,
              message: `Contract '${contract}' is not valid contract`,
            })
          }

          const query = {
            sql: `INSERT INTO customRef.mktdata_marketdataalarms (tablerownames,contract,field,alertLow,alertHigh,enabled,lowDirty,highDirty,numTriggers,currentValue) VALUES (1,'${contract.toUpperCase()}','${field}','','','TRUE','FALSE','FALSE',0,0)`,
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          const isAlarmExist = await db.alarms.isExist(contract, field)
          if (isAlarmExist) {
            return res.code(409).send({
              success: false,
              message: 'Alarm already exist',
            })
          }

          await connection
            .query(query.sql)
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
    url: `${prefix}/delete_alert/:contract/:field`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { contract, field } = req.params as CommonAlertData

          const query = {
            sql: `DELETE FROM customRef.mktdata_marketdataalarms WHERE contract='${contract.toUpperCase()}' AND field='${field}'`,
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

  {
    method: 'PUT',
    url: `${prefix}/update_enabled/:contract/:field`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { contract, field } = req.params as CommonAlertData
          const { enabled, numTriggers } = req.body as UpdateAlertEnabledBody
          const _enabled = enabled ? 'TRUE' : 'FALSE'

          const query = {
            sql: `UPDATE customRef.mktdata_marketdataalarms SET enabled='${_enabled}', numTriggers='${numTriggers}' WHERE contract='${contract}' AND field='${field}'`,
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          const isAlarmExist = await db.alarms.isExist(contract, field)
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

  {
    method: 'PUT',
    url: `${prefix}/update/:contract/:field`,
    handler(req, res) {
      db.pool
        .getConnection()
        .then(async (connection) => {
          const { contract, field } = req.params as CommonAlertData
          const { alertLow, alertHigh } = req.body as UpdateAlertBody

          const query = {
            sql: `UPDATE customRef.mktdata_marketdataalarms SET alertLow='${alertLow}', alertHigh='${alertHigh}' WHERE contract='${contract}' AND field='${field}'`,
          }

          res.header('X-IRMS-SQL-QUERY', query.sql)
          res.header('X-IRMS-TIMESTAMP', helpers.getCurrentTimestamp())

          const isAlarmExist = await db.alarms.isExist(contract, field)
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
                message: 'Successfully update alarm',
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(connection.end)
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  /* -------------------------- GET CONTRACTS -------------------------- */
  // {
  //   method: 'GET',
  //   url: `${prefix}/get_contracts`,
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
  //   url: `${prefix}/test`,
  //   async handler(req, res) {
  //     res.send({ message: 'hello world' })
  //   },
  // },
]

export default routes
