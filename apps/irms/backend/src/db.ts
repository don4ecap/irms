import mariadb from 'mariadb'

const db = mariadb.createConnection({
  host: '10.153.64.65',
  user: 'root',
  port: 3304,
  password: 'FOUR2008',
})

export default db
