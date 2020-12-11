import request from '@/plugin/axios'

const baseURL = '/aliyun/slb'

export function queryAliyunSLBPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function syncAliyunSLB () {
  return request({
    url: baseURL + '/sync',
    method: 'get'
  })
}

export function refreshSLBListener (loadBalancerId) {
  return request({
    url: baseURL + '/refresh/listener?loadBalancerId=' + loadBalancerId,
    method: 'get'
  })
}

export function linkNginx (id) {
  return request({
    url: baseURL + '/link/nginx?id=' + id,
    method: 'get'
  })
}

export function queryLinkNginxSLB () {
  return request({
    url: baseURL + '/link/nginx/query',
    method: 'get'
  })
}

export function querySLBListenerBackendServers (loadBalancerId) {
  return request({
    url: baseURL + '/backend/server/query?loadBalancerId=' + loadBalancerId,
    method: 'get'
  })
}
