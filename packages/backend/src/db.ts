import mariadb from 'mariadb'
import config from './config'
import helpers from './helpers'
import { ICMSNavData } from 'irms-shared-types'

interface IConnectionStringConfig {
  DRIVER: string
  UID: string
  pwd: string
  PORT: string
  DATABASE: string
  SERVER: string
}

console.log('Load iRMS config file from', config.IRMS_CONFIG.CONFIG_FILE_PATH)

const reQuotes = /"|'/g
const connectionString: string = config.getConfig('IRMS_DB_CONNECTIONSTRING')
const connectionStringFields = connectionString
  .replace(reQuotes, '')
  .split(';')
  .map((field) => {
    const [key, value] = field.split('=')
    const obj: any = {}
    obj[key] = value.replace(reQuotes, '')
    return obj
  })
  .reduce((prevField, currField) => ({
    ...prevField,
    ...currField,
  })) as IConnectionStringConfig

// console.log(config.getConfig('ORDER_GENERATION_CODE').replace(reQuotes, ''))

const dbConfig = {
  host: connectionStringFields.SERVER,
  user: connectionStringFields.UID,
  port: parseInt(connectionStringFields.PORT),
  password: connectionStringFields.pwd,
  decimalAsNumber: true,
  bigIntAsNumber: true,
  dateStrings: true,
  connectionLimit: 5,
}

const pool = mariadb.createPool(dbConfig)

/* ------------------------------ ALARMS MODELS ----------------------------- */
const alarms = {
  /** Check if an alarm exist */
  async isExist(contract: string, field: string) {
    let connection
    try {
      connection = await pool.getConnection()
    } catch (error) {
      console.error(error)
    }
    const result = await connection?.query(
      `SELECT * FROM customRef.mktdata_marketdataalarms WHERE contract='${contract}' AND field='${field}'`
    )
    connection?.end()
    return result.length > 0
  },

  /** Get alarm by `contract` and `field` */
  async getAlarm(contract: string, field: string) {
    let connection
    try {
      connection = await pool.getConnection()
    } catch (error) {
      console.error(error)
    }
    const result = await connection?.query(
      `SELECT * FROM customRef.mktdata_marketdataalarms WHERE contract='${contract}' AND field='${field}'`
    )
    connection?.end()
    return result[0]
  },
}

/* ------------------------------- ICMS MODELS ------------------------------ */
const icms = {
  /** Get single nav */
  async getNav(
    account: string,
    tradeDate: string
  ): Promise<ICMSNavData | null> {
    try {
      const connection = await pool.getConnection()
      const result = await connection?.query(
        'SELECT * FROM trading.tblnav WHERE account=? AND date=? ORDER BY date DESC',
        [account, helpers.formatDate(tradeDate)]
      )
      connection.end()
      return result.length ? result[0] : null
    } catch (error) {
      console.error(error)
      return null
    }
  },

  /** Get list of nav by account and trade date */
  async getNewerNavs(
    account: string,
    tradeDate: string
  ): Promise<Array<ICMSNavData>> {
    try {
      const connection = await pool.getConnection()
      const result = await connection?.query(
        'SELECT * FROM trading.tblnav WHERE account=? AND date > ? ORDER BY date DESC',
        [account, helpers.formatDate(tradeDate)]
      )
      connection.end()
      return result
    } catch (error) {
      console.error(error)
      return []
    }
  },

  async updateNavField(
    account: string,
    tradeDate: string,
    nav: number
  ): Promise<boolean> {
    try {
      const connection = await pool.getConnection()
      const result = await connection?.query(
        'UPDATE trading.tblnav SET nav=? WHERE account=? AND date=?',
        [nav, account, helpers.formatDate(tradeDate)]
      )
      connection.end()
      return !!result.affectedRows
    } catch (error) {
      console.error(error)
      return false
    }
  },

  async isFeesExist(
    commodity: string,
    extension: string,
    instrument: string,
    account: string
  ): Promise<boolean> {
    try {
      const connection = await pool.getConnection()
      const result = await connection.query(
        'SELECT commodity FROM tradingRef.tblTradingFees WHERE commodity=? AND extension=? AND instrument=? AND account=?',
        [commodity, extension, instrument, account]
      )
      await connection.end()
      return result.length > 0
    } catch (error) {
      console.error(error)
      return true
    }
  },
}

const contracts = {
  async getContract(contract: string, extension: string) {
    let connection
    try {
      connection = await pool.getConnection()
    } catch (error) {
      console.error(error)
    }
    const result = await connection?.query(
      `SELECT * FROM tradingDB.contracts WHERE contract_twodigit='${contract}' AND extension='${extension}'`
    )
    connection?.end()
    return result || []
  },
}

export default {
  alarms,
  config: dbConfig,
  contracts,
  icms,
  pool,
}
