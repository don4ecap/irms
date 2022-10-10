import axios from 'axios'

const serverAPI = axios.create({
  baseURL: 'http://localhost:8000/api',
})

serverAPI.interceptors.request.use((req) => {
  req.headers['Content-Type'] = 'application/json'
  req.headers['Accept'] = 'application/json'
  return req
})

export default serverAPI
