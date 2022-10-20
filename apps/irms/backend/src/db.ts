import mariadb from 'mariadb'

const db = mariadb.createPool({
  host: '10.153.64.65',
  user: 'root',
  port: 3304,
  password: 'FOUR2008',
  decimalAsNumber: true,
  connectionLimit: 5,
})

export default db
