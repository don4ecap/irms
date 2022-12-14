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
} from './types'
import db from './db'
import schemas from './schemas'
import axios from 'axios'
import config from './config'
import helpers from './helpers'

const prefix = '/api'

const internalServerErrorHandler = (res: FastifyReply) => (error: any) => {
  console.error(error)
  return res.status(500).send({ message: 'Internal server error' })
}

const routes: Array<RouteOptions> = [
  // GET NAV
  {
    method: 'GET',
    url: `${prefix}/get_nav/:account/:trade_date`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams
          connection
            .query(
              'SELECT * FROM trading.tblfonav WHERE account=? AND td <= ? ORDER BY TIMESTAMP DESC LIMIT 1',
              [params.account, params.trade_date]
            )
            .then((rows) => {
              return res.send(rows[0] || {})
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_book/:account/:trade_date`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams
          connection
            .query(
              'SELECT * FROM trading.irms WHERE irms.account=? AND irms.td=? ORDER BY irms.orderNo, irms.year ASC, irms.month ASC',
              [params.account, params.trade_date]
            )
            .then((rows) => {
              return res.send(rows)
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_portfolio/:account/:trade_date`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams
          connection
            .query(
              `SELECT 
              SUM(positions_pct_target) AS positions_pct_target, 
              SUM(qty) AS qty, 
              SUM(current_allocation_pct) AS current_allocation_pct, 
              SUM(current_allocation_lots) AS current_allocation_lots, 
              SUM(target_allocation_pct) AS target_allocation_pct, 
              SUM(target_allocation_lots) AS target_allocation_lots, 
              SUM(current_risks_pre) AS current_risks_pre, 
              SUM(target_risks_pre) AS target_risks_pre 
            FROM 
              trading.irms 
            WHERE 
              account=? 
              AND td=?
              AND rowtype='sector' 
              AND instrument <> 'cash'`,
              [params.account, params.trade_date]
            )
            .then((rows) => {
              return res.send(rows[0] || {})
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'GET',
    url: `${prefix}/check_last_calculated/:account`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: AccountOnlyParams = req.params as AccountOnlyParams
          connection
            .query(
              `SELECT value FROM cacheDB.cache2 WHERE Name LIKE 'irms_calculate_${params.account}' LIMIT 1`
            )
            .then((rows) => {
              return res.send(rows[0] || { value: '' })
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_commo_indicator_level`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          connection
            .query(
              'SELECT contract, maxLevel FROM customRef.execution_commoindicatormaxlevel_ees_live'
            )
            .then((rows) => {
              return res.send(rows)
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_strategies`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          connection
            .query('SELECT strategy_name FROM trading.ie_strategy')
            .then((strategies = []) => {
              return res.send(
                strategies.map((strategy: any) => strategy.strategy_name)
              )
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

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
        db.getConnection()
          .then((connection) => {
            const { account, trade_date } = params
            const { order_qty, order_p, contract, extension } = body
            connection
              .query(
                `UPDATE
                    trading.irms
                SET
                    orderQ=?,
                    orderP=?
                WHERE
                  irms.account=?
                  AND
                  irms.contract=?
                  AND
                  irms.extension=?
                  AND
                  irms.td=?
                `,
                [order_qty, order_p, account, contract, extension, trade_date]
              )
              .then((result) => {
                return res.send({
                  id: result.affectedRows ? body.id : -1,
                  result: result.query,
                })
              })
              .catch(internalServerErrorHandler(res))
              .finally(() => {
                connection.end()
              })
          })
          .catch(internalServerErrorHandler(res))
      }
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_working/:account/:trade_date`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams
          connection
            .query(
              `SELECT
                contract,
                extension,
                instrument,
                strategy,
                price
              FROM
                trading.tbltrading
              WHERE
                  tbltrading.account=?
                AND
                  tbltrading.cdate=?
                AND
                  tbltrading.status NOT LIKE 'EXPIR%'`,
              [params.account, params.trade_date]
            )
            .then((rows) => {
              return res.send(rows)
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'DELETE',
    url: `${prefix}/delete_all_orders/:account/:trade_date`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: CommonRequestParams = req.params as CommonRequestParams

          let query = `UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=?`
          // @ts-ignore
          if (req?.body?.sector) {
            query += 'AND irms.sector=?'
          }

          connection
            .query(query, [
              params.account,
              params.trade_date,
              // @ts-ignore
              req?.body?.sector || '',
            ])
            .then((result) => {
              return res.send({
                updated: result.affectedRows >= 1,
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'DELETE',
    url: `${prefix}/delete_single/:account/:trade_date/:contract/:extension`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: DeleteSingleParams = req.params as DeleteSingleParams

          connection
            .query(
              `UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=? AND irms.contract=? AND irms.extension=?`,
              [
                params.account,
                params.trade_date,
                params.contract,
                params.extension,
              ]
            )
            .then((result) => {
              return res.send({
                updated: result.affectedRows >= 1,
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

  {
    method: 'DELETE',
    url: `${prefix}/delete_commodity/:account/:trade_date/:commodity/:extension`,
    handler(req, res) {
      db.getConnection()
        .then((connection) => {
          const params: DeleteCommodityParams =
            req.params as DeleteCommodityParams

          connection
            .query(
              'UPDATE trading.irms SET irms.orderQ=NULL, irms.orderP=NULL WHERE irms.account=? AND irms.td=? AND irms.commo=? AND irms.extension=?',
              [
                params.account,
                params.trade_date,
                params.commodity,
                params.extension,
              ]
            )
            .then((result) => {
              return res.send({
                deleted: result.affectedRows >= 1,
              })
            })
            .catch(internalServerErrorHandler(res))
            .finally(() => {
              connection.end()
            })
        })
        .catch(internalServerErrorHandler(res))
    },
  },

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
        db.getConnection()
          .then((connection) => {
            const { contract1, contract2, extension } = body
            let query: string

            if (extension !== 'Comdty') {
              query = `SELECT
                          contract_onedigit,
                          contract_twodigit 
                        FROM
                          trading.tbltradinguniverse
                        WHERE
                          contract_onedigit=?
                        UNION
                          SELECT
                            contract_onedigit,
                            contract_twodigit
                          FROM
                            trading.tbltradinguniverse
                          WHERE
                            contract_onedigit=?`
            } else {
              query = `SELECT
                        contract_onedigit,
                        contract_twodigit
                      FROM 
                        trading.tbltradinguniverse
                      WHERE
                        contract_onedigit IN (?, ?)
                      ORDER BY
                        year,month`
            }
            connection
              .query(query, [contract1, contract2])
              .then((rows) => {
                return res.send(rows || [])
              })
              .catch(internalServerErrorHandler(res))
              .finally(() => {
                connection.end()
              })
          })
          .catch(internalServerErrorHandler(res))
      }
    },
  },

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
          const result = configString
            .match(/\*\*\*\s=\s(\w*)/gs)
            .map((tag: string) => tag.split('=')[1].trim())
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
        db.getConnection()
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

            connection
              .query(
                `INSERT INTO
                    trading.tbltrading (
                      tradeID,
                      cdate,
                      qty,
                      contract,
                      price,
                      account,
                      source,
                      status,
                      sendToBO,
                      expiry,
                      birth,
                      freetext,
                      strategy,
                      contract_twodigit,
                      commo,
                      extension,
                      instrument
                    )
                    VALUES(?, ?, ?, ?, ?, ?, 'ORDERS', 'NEW', 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
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
                ]
              )
              .then((/* result */) => {
                return res.send({
                  result: index,
                })
              })
              .catch(internalServerErrorHandler(res))
              .finally(() => {
                connection.end()
              })
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
        return res.status(500).send({ message: 'Internal server error' })
      }
    },
  },

  // {
  //   method: 'GET',
  //   url: `${prefix}/test`,
  //   async handler(req, res) {
  //     res.send({ message: 'hello world' })
  //   },
  // },
]

export default routes
