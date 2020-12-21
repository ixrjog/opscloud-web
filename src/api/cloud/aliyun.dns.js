import request from '@/plugin/axios'

const baseURL = '/aliyun/dns'

export function queryAliyunDNSPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function addAliyunDomainRecord (data) {
  return request({
    url: baseURL + '/add',
    method: 'post',
    data
  })
}

export function updateDomainRecord (data) {
  return request({
    url: baseURL + '/update',
    method: 'put',
    data
  })
}

export function domainRecordStatusUpdate (data) {
  return request({
    url: baseURL + '/status/update',
    method: 'put',
    data
  })
}

export function syncAliyunDomainRecord () {
  return request({
    url: baseURL + '/sync',
    method: 'get'
  })
}

export function syncAliyunDomainRecordByName (domainName) {
  return request({
    url: baseURL + '/domain/sync?domainName=' + domainName,
    method: 'get'
  })
}

export function delDomainRecord (recordId) {
  return request({
    url: baseURL + '/del?recordId=' + recordId,
    method: 'delete'
  })
}
