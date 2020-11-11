import request from '@/plugin/axios'

const baseUrl = '/aliyun/ons/instance'

export function queryONSInstanceAll () {
  return request({
    url: baseUrl + '/all/query',
    method: 'get'
  })
}

export function onsInstanceStatistics () {
  return request({
    url: baseUrl + '/statistics',
    method: 'get'
  })
}

export function queryONSInstanceList (regionId) {
  return request({
    url: baseUrl + '/query?regionId=' + regionId,
    method: 'get'
  })
}

export function syncONSInstance (regionId) {
  return request({
    url: baseUrl + '/sync?regionId=' + regionId,
    method: 'get'
  })
}

export function refreshONSInstanceDetail (data) {
  return request({
    url: baseUrl + '/refresh',
    method: 'post',
    data
  })
}
