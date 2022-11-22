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

const db = mariadb.createPool({
  host: connectionStringFields.SERVER,
  user: connectionStringFields.UID,
  port: parseInt(connectionStringFields.PORT),
  password: connectionStringFields.pwd,
  decimalAsNumber: true,
  connectionLimit: 5,
})

export default db
