import { RouteOptions } from 'fastify'
import type { GetNavRequestParams } from './types'
import db from './db'

const prefix = '/api'

const routes: Array<RouteOptions> = [
  // GET NAV
  {
    method: 'GET',
    url: `${prefix}/get_nav/:account/:trade_date`,
    handler(req, res) {
      db.then((connection) => {
        const params: GetNavRequestParams = req.params as GetNavRequestParams
        connection
          .query(
            `SELECT * FROM tblfonav WHERE account='${params.account}' AND td <= '${params.trade_date}' ORDER BY TIMESTAMP DESC LIMIT 1;`
          )
          .then((rows) => {
            res.send(rows[0])
          })
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
