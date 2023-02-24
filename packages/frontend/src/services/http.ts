import axios from 'axios'

const serverAPI = axios.create({
  baseURL: import.meta.env.VITE_IRMS_BACKEND_URL,
})

serverAPI.interceptors.request.use((req) => {
  req.headers['Content-Type'] = 'application/json'
  req.headers['Accept'] = 'application/json'
  return req
})

function logQuery(timestamp: string, query: string) {
  const logsEl = document.body.querySelector('#logs')
  const line = document.createElement('div')
  const timestampEl = document.createElement('div')
  const queryEl = document.createElement('div')

  line.classList.add('flex')
  timestampEl.style.marginRight = '0.9rem'

  timestampEl.textContent = `[${timestamp}]`
  queryEl.textContent = query

  line.appendChild(timestampEl)
  line.appendChild(queryEl)
  logsEl.prepend(line)
  //@ts-ignore
  if (IRMS_APP.$children[0].showQueryLog && window.autoScrollToFirstLine) {
    logsEl.scrollTop = 0
  }
}

serverAPI.interceptors.response.use(
  (res) => {
    if (res?.headers['x-irms-sql-query']) {
      logQuery(res.headers['x-irms-timestamp'], res.headers['x-irms-sql-query'])
    }
    return Promise.resolve(res)
  },
  function (error) {
    if (error?.response.headers['x-irms-sql-query']) {
      logQuery(
        error.response.headers['x-irms-timestamp'],
        error.response.headers['x-irms-sql-query']
      )
    }
    return Promise.reject(error)
  }
)

export default serverAPI
