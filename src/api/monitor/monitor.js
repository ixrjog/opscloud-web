import request from '@/plugin/axios'

const baseUrl = '/monitor'

export function queryMonitorHostPage (data) {
  return request({
    url: baseUrl + '/host/page/query',
    method: 'post',
    data
  })
}

export function syncMonitorHostStatus () {
  return request({
    url: baseUrl + '/host/status/sync',
    method: 'get'
  })
}

export function createMonitorHost (data) {
  return request({
    url: baseUrl + '/host/create',
    method: 'post',
    data
  })
}

export function pushMonitorHost (data) {
  return request({
    url: baseUrl + '/host/push',
    method: 'put',
    data
  })
}

export function setMonitorHostStatus (id) {
  return request({
    url: baseUrl + '/host/status/set?id=' + id,
    method: 'put'
  })
}
