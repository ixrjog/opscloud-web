import request from '@/plugin/axios'

const baseURL = '/nginx/custom'

export function queryNginxCustomInstancePage (data) {
  return request({
    url: baseURL + '/instance/page/query',
    method: 'post',
    data
  })
}

export function saveNginxCustomInstance (data) {
  return request({
    url: baseURL + '/instance/save',
    method: 'post',
    data
  })
}

export function delNginxCustomInstance (id) {
  return request({
    url: baseURL + '/instance/del?id=' + id,
    method: 'delete'
  })
}

export function previewNginxCustomInstance (data) {
  return request({
    url: baseURL + '/instance/preview',
    method: 'post',
    data
  })
}

export function nginxCustomInstanceCheck (instanceName) {
  return request({
    url: baseURL + '/instance/check?instanceName=' + instanceName,
    method: 'get'
  })
}

export function syncNginxCustomConf () {
  return request({
    url: baseURL + '/instance/conf/sync',
    method: 'get'
  })
}

export function pushNginxCustomConf (instanceName) {
  return request({
    url: baseURL + '/instance/conf/push?instanceName=' + instanceName,
    method: 'get'
  })
}
