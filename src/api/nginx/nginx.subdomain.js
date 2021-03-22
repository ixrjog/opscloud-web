import request from '@/plugin/axios'

const baseURL = '/nginx/subdomain/forward'

export function querySubdomainForwardPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function querySubdomainForwardInstancePage (data) {
  return request({
    url: baseURL + '/instance/page/query',
    method: 'post',
    data
  })
}

export function saveSubdomainForward (data) {
  return request({
    url: baseURL + '/save',
    method: 'post',
    data
  })
}

export function saveSubdomainForwardInstance (data) {
  return request({
    url: baseURL + '/instance/save',
    method: 'post',
    data
  })
}

export function delSubdomainForward (id) {
  return request({
    url: baseURL + '/del?id=' + id,
    method: 'delete'
  })
}

export function delSubdomainForwardInstance (id) {
  return request({
    url: baseURL + '/instance/del?id=' + id,
    method: 'delete'
  })
}

export function previewSubdomainForwardInstance (data) {
  return request({
    url: baseURL + '/instance/preview',
    method: 'post',
    data
  })
}

export function subdomainForwardInstanceCheck (data) {
  return request({
    url: baseURL + '/instance/check',
    method: 'post',
    data
  })
}

export function pushDomainRecord (data) {
  return request({
    url: baseURL + '/instance/dns/push',
    method: 'post',
    data
  })
}

export function pushSubdomainConf (data) {
  return request({
    url: baseURL + '/instance/conf/push',
    method: 'post',
    data
  })
}
