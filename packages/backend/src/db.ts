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

export default {
  pool,
  config: dbConfig,
}
