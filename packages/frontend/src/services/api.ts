import http from './http'

function postOrderContracts(
  contract1: string,
  contract2: string,
  extension: string
) {
  return http.irms
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
  postOrderContracts,
}
