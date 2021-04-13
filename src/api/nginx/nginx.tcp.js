import request from '@/plugin/axios'

const baseURL = '/nginx/tcp/forward'

export function queryTcpForwardInstancePage (data) {
  return request({
    url: baseURL + '/instance/page/query',
    method: 'post',
    data
  })
}

export function saveTCPForwardInstance (data) {
  return request({
    url: baseURL + '/instance/save',
    method: 'post',
    data
  })
}

export function delTCPForwardInstance (id) {
  return request({
    url: baseURL + '/instance/del?id=' + id,
    method: 'delete'
  })
}

export function previewTCPForwardInstance (data) {
  return request({
    url: baseURL + '/instance/preview',
    method: 'post',
    data
  })
}

export function tcpForwardInstanceCheck (port) {
  return request({
    url: baseURL + '/instance/check?port=' + port,
    method: 'get'
  })
}

export function syncTcpConf () {
  return request({
    url: baseURL + '/instance/conf/sync',
    method: 'get'
  })
}

export function pushTcpConf (listerPort) {
  return request({
    url: baseURL + '/instance/conf/push?listerPort=' + listerPort,
    method: 'get'
  })
}
