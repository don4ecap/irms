import mariadb from 'mariadb'
import config from './config'

interface IConnectionStringConfig {
  DRIVER: string
  UID: string
  pwd: string
  PORT: string
  DATABASE: string
  SERVER: string
}

console.log('Load iRMS config file from', config.configFilePath)

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
  pool,
  config: dbConfig,
  alarms,
  contracts,
}
