import request from '@/plugin/axios'

export function queryCloudServerPage (cloudServerType, serverName, queryIp, serverStatus, page, length) {
  return request({
    url: '/cloud/server/page/query?cloudServerType=' + cloudServerType + '&serverName=' + serverName +
      '&queryIp=' + queryIp + '&serverStatus=' + serverStatus + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function queryCloudServerChargePage (data) {
  return request({
    url: '/cloud/server/charge/page/query',
    method: 'post',
    data
  })
}

export function syncCloudServerByKey (cloudServerKey) {
  return request({
    url: '/cloud/server/sync?key=' + cloudServerKey,
    method: 'get'
  })
}

export function deleteCloudServerById (id) {
  return request({
    url: '/cloud/server/del?id=' + id,
    method: 'delete'
  })
}

export function cloudServerPowerOn (data) {
  return request({
    url: '/cloud/server/power/on',
    method: 'post',
    data
  })
}

export function cloudServerPowerStatus (data) {
  return request({
    url: '/cloud/server/power/status',
    method: 'post',
    data
  })
}
