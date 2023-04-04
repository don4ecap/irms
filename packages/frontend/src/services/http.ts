import axios, { AxiosInstance } from 'axios'

interface AXIOS_EXTENDED_IRMS extends AxiosInstance {
  postOrderContracts?: (
    contract1: string,
    contract2: string,
    extension: string
  ) => Promise<any>
}

const irms: AXIOS_EXTENDED_IRMS = axios.create({
  baseURL: import.meta.env.VITE_IRMS_BACKEND_URL,
})

irms.interceptors.request.use((req) => {
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

irms.interceptors.response.use(
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

irms.postOrderContracts = function (
  contract1: string,
  contract2: string,
  extension: string
) {
  return irms
    .post(`order_contracts`, {
      contract1,
      contract2,
      extension,
    })
    .then(({ data }) => {
      return Promise.resolve(data)
    })
    .catch((error) => {
      console.error('Error when post order contracts:\n', error)
      return Promise.resolve([])
    })
}

export default {
  irms,
}
