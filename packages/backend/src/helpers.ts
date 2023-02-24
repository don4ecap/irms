const prefixZero = (v: number) => (v < 10 ? '0' + v : v)

/** returns current timestamp string in the format of `yyyy-MM-dd HH:mm:ss.sss` */
const getCurrentTimestamp = () =>
  new Date().toISOString().replace('T', ' ').replace('Z', '')

function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getCurrentDate() {
  const now = new Date()
  return [
    now.getFullYear(),
    prefixZero(now.getMonth() + 1),
    prefixZero(now.getDate()),
  ].join('-')
}

function formatDate(date: string) {
  const _date = new Date(date)
  return [
    _date.getFullYear(),
    prefixZero(_date.getMonth() + 1),
    prefixZero(_date.getDate()),
  ].join('-')
}

function toDateISOString(date: string) {
  if (typeof date !== 'string') return date
  return date.replace(' ', 'T')
}

function properRound(number: string): number {
  // @ts-ignore
  const a = (number / 1_0_0) * 1_0_0
  // @ts-ignore
  return Math.round(parseFloat(a))
}

/** This function takes a value and escapes it for use in a SQL query */
function sqlEscape(value: any) {
  if (typeof value === 'string') {
    // Escape special characters like single quotes and backslashes
    // eslint-disable-next-line no-control-regex
    value = value.replace(/[\0\n\r\b\t'"\x1a]/g, function (char) {
      switch (char) {
        case '\0':
          return '\0'
        case '\n':
          return '\n'
        case '\r':
          return '\r'
        case '\b':
          return '\b'
        case '\t':
          return '\t'
        case '\x1a':
          return 'Z'
        default:
          return '\\' + char
      }
    })
  }
  // Return the escaped value
  return value
}

/**
This function takes a SQL query string and an array of parameters as input.
It replaces all occurrences of "?" in the query string with the next value in the parameters array
and escapes the value to prevent SQL injection attacks.

@param {string} query - the SQL query string
@param {Array<any>} params - an array of parameters to be inserted into the query
@return {string} - the SQL query string with parameters inserted and escaped
*/
function queryString(query: string, params: Array<any>): string {
  // Create a copy of the params array to avoid modifying the original array
  const paramsCopy = params.slice()
  // Convert the query argument to a string (in case it's not already a string)
  // and replace all occurrences of "?" with the corresponding values from the params array
  return String(query).replace(/\?/g, () => {
    // Remove the first element from the paramsCopy array and assign it to the value variable
    const value = paramsCopy.shift()
    // Apply the sqlEscape function to the value variable
    // to ensure that it is properly escaped for use in a SQL query
    return sqlEscape(value)
  })
}

export default {
  createUUID,
  formatDate,
  getCurrentDate,
  getCurrentTimestamp,
  properRound,
  queryString,
  toDateISOString,
}
