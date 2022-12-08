import axios from 'axios'

const serverAPI = axios.create({
  baseURL: import.meta.env.VITE_IRMS_BACKEND_URL,
})

serverAPI.interceptors.request.use((req) => {
  req.headers['Content-Type'] = 'application/json'
  req.headers['Accept'] = 'application/json'
  return req
})

export default serverAPI
