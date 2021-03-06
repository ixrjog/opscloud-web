import request from '@/plugin/axios'

const baseURL = '/nginx/upstream'

export function queryUpstreamPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function saveUpstream (data) {
  return request({
    url: baseURL + '/save',
    method: 'post',
    data
  })
}

export function delUpstream (id) {
  return request({
    url: baseURL + '/del?id=' + id,
    method: 'delete'
  })
}

export function previewUpstream (data) {
  return request({
    url: baseURL + '/preview',
    method: 'post',
    data
  })
}

export function syncUpstreamConf () {
  return request({
    url: baseURL + '/conf/sync',
    method: 'get'
  })
}

export function pushUpstreamConf (backendName) {
  return request({
    url: baseURL + '/conf/push?backendName=' + backendName,
    method: 'get'
  })
}
