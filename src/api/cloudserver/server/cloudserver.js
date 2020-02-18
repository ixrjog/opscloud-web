import request from '@/plugin/axios'

export function queryCloudserverPage (cloudserverType, serverName, queryIp, serverStatus, page, length) {
  return request({
    url: '/cloudserver/server/page/query?cloudserverType=' + cloudserverType + '&serverName=' + serverName +
      '&queryIp=' + queryIp + '&serverStatus=' + serverStatus + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function syncCloudserverByKey (cloudserverKey) {
  return request({
    url: '/cloudserver/server/sync?key=' + cloudserverKey,
    method: 'get'
  })
}

export function deleteCloudserverById (id) {
  return request({
    url: '/cloudserver/server/del?id=' + id,
    method: 'delete'
  })
}
