import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const pigeonApi = {
  getAll: () => api.get('/pigeons'),
  getById: (id) => api.get(`/pigeons/${id}`),
  getByRing: (ringNumber) => api.get(`/pigeons/ring/${ringNumber}`),
  create: (data) => api.post('/pigeons', data),
  update: (id, data) => api.put(`/pigeons/${id}`, data),
  delete: (id) => api.delete(`/pigeons/${id}`),
  getChildren: (id) => api.get(`/pigeons/${id}/children`),
}

export const breedingApi = {
  getAll: () => api.get('/breeding'),
  getById: (id) => api.get(`/breeding/${id}`),
  getByPigeon: (pigeonId) => api.get(`/breeding/pigeon/${pigeonId}`),
  create: (data) => api.post('/breeding', data),
  update: (id, data) => api.put(`/breeding/${id}`, data),
  delete: (id) => api.delete(`/breeding/${id}`),
  checkKinship: (fatherId, motherId, maxDepth) =>
    api.get(`/breeding/check-kinship`, {
      params: { fatherId, motherId, maxDepth },
    }),
}

export const raceApi = {
  getAll: () => api.get('/races'),
  getById: (id) => api.get(`/races/${id}`),
  create: (data) => api.post('/races', data),
  update: (id, data) => api.put(`/races/${id}`, data),
  delete: (id) => api.delete(`/races/${id}`),
  endRace: (id) => api.post(`/races/${id}/end`),
}

export const raceResultApi = {
  getByRace: (raceId) => api.get(`/race-results/race/${raceId}`),
  scanArrival: (data) => api.post('/race-results/scan', data),
  simulateArrival: (data) => api.post('/race-results/simulate', data),
}

export default api
