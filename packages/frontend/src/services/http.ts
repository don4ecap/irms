import axios, { AxiosInstance, AxiosResponse } from 'axios'
import PageControls from '../helpers/PageControls'

interface IRMSHttpClientInstance extends AxiosInstance {
  postOrderContracts?: (
    contract1: string,
    contract2: string,
    extension: string
  ) => Promise<any>
}

/** Create new HTTP client with commonly used configuration */
function createCommonHttpClient(baseURL: string) {
  const httpClient = axios.create({
    baseURL: baseURL,
  })

  httpClient.interceptors.request.use((req) => {
    req.headers['Content-Type'] = 'application/json'
    req.headers['Accept'] = 'application/json'
    return req
  })

  httpClient.interceptors.response.use(
    function (res: AxiosResponse) {
      if (res?.headers['x-irms-sql-query']) {
        PageControls.logQuery(
          res.headers['x-irms-timestamp'],
          res.headers['x-irms-sql-query'],
          res.request.responseURL
        )
      }
      return Promise.resolve(res)
    },
    function (error) {
      if (error?.response.headers['x-irms-sql-query']) {
        PageControls.logQuery(
          error.response.headers['x-irms-timestamp'],
          error.response.headers['x-irms-sql-query'],
          error.response.request.responseURL
        )
      }
      return Promise.reject(error)
    }
  )

  return httpClient
}

/** HTTP client instance with extended methods related with iRMS API */
const irms = createCommonHttpClient(
  import.meta.env.VITE_IRMS_BACKEND_URL
) as IRMSHttpClientInstance

irms.postOrderContracts = function (
  contract1: string,
  contract2: string,
  extension: string
) {
  return irms
    .post(`orderContracts`, {
      contract1,
      contract2,
      extension,
    })
    .then(({ data }) => {
      return Promise.resolve(data.data)
    })
    .catch((error) => {
      console.error('Error when post order contracts:\n', error)
      return Promise.resolve([])
    })
}

/** HTTP client instance with extended methods related with iCMS API */
const icms = createCommonHttpClient(import.meta.env.VITE_ICMS_BACKEND_URL)

export default {
  irms,
  icms,
}
