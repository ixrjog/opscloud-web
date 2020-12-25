import request from '@/plugin/axios'

const baseURL = '/workorder'

export function queryWorkorderStatsByMonth () {
  return request({
    url: baseURL + '/month/stats',
    method: 'get'
  })
}

export function queryWorkorderStatsByName () {
  return request({
    url: baseURL + '/name/stats',
    method: 'get'
  })
}
