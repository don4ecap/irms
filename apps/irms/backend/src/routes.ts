import { FastifyReply, RouteOptions } from 'fastify'
import type { GetNavRequestParams } from './types'
import dbConnection from './db'

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
      dbConnection.then((connection) => {
        const params: GetNavRequestParams = req.params as GetNavRequestParams
        connection
          .query(
            `SELECT * FROM trading.tblfonav WHERE account='${params.account}' AND td <= '${params.trade_date}' ORDER BY TIMESTAMP DESC LIMIT 1;`
          )
          .then((rows) => {
            return res.send(rows[0])
          })
          .catch(internalServerErrorHandler(res))
      })
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_book/:account/:trade_date`,
    handler(req, res) {
      dbConnection.then((connection) => {
        const params: GetNavRequestParams = req.params as GetNavRequestParams
        connection
          .query(
            `SELECT * FROM trading.irms WHERE irms.account='${params.account}' AND td='${params.trade_date}' ORDER BY irms.orderNo, irms.year ASC, irms.month ASC`
          )
          .then((rows) => {
            return res.send(rows)
          })
          .catch(internalServerErrorHandler(res))
      })
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_portfolio/:account/:trade_date`,
    handler(req, res) {
      dbConnection.then((connection) => {
        const params: GetNavRequestParams = req.params as GetNavRequestParams
        connection
          .query(
            `SELECT 
              id,
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
              account = '${params.account}' 
              AND td = '${params.trade_date}' 
              AND rowtype = 'sector' 
              AND instrument <> 'cash'`
          )
          .then((rows) => {
            return res.send(rows[0])
          })
          .catch(internalServerErrorHandler(res))
      })
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_commo_indicator_level`,
    handler(req, res) {
      dbConnection.then((connection) => {
        connection
          .query(
            `SELECT contract, maxLevel FROM customRef.execution_commoindicatormaxlevel_ees_live`
          )
          .then((rows) => {
            return res.send(rows)
          })
          .catch(internalServerErrorHandler(res))
      })
    },
  },

  {
    method: 'GET',
    url: `${prefix}/get_strategies`,
    handler(req, res) {
      dbConnection.then((connection) => {
        connection
          .query(`SELECT strategy_name from trading.ie_strategy`)
          .then((rows) => {
            return res.send(rows)
          })
          .catch(internalServerErrorHandler(res))
      })
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
