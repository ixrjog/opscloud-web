import request from '@/plugin/axios'

const baseUrl = '/monitor/host'

export function queryMonitorHostPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function syncMonitorHostStatus () {
  return request({
    url: baseUrl + '/status/sync',
    method: 'get'
  })
}

export function createMonitorHost (data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function pushMonitorHost (data) {
  return request({
    url: baseUrl + '/push',
    method: 'put',
    data
  })
}

export function setMonitorHostStatus (id) {
  return request({
    url: baseUrl + '/status/set?id=' + id,
    method: 'put'
  })
}
