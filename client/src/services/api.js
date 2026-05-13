// services/api.js — axios instance with auth token injection
import axios from 'axios'
import useLearnStore from '../store/useLearnStore'

const api = axios.create({ baseURL: '' })

api.interceptors.request.use((config) => {
  const token = useLearnStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
