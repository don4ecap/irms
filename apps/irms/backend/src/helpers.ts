const prefixZero = (v: number) => (v < 10 ? '0' + v : v)

function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getCurrentDate() {
  const now = new Date('2022-1-1')
  return [
    now.getFullYear(),
    prefixZero(now.getMonth() + 1),
    prefixZero(now.getDate()),
  ].join('-')
}

export default {
  createUUID,
  getCurrentDate,
}
