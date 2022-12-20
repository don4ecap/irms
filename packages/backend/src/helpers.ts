const prefixZero = (v: number) => (v < 10 ? '0' + v : v)

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

export default {
  createUUID,
  getCurrentDate,
  toDateISOString,
  formatDate,
}
