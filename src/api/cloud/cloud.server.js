import request from '@/plugin/axios'

const baseUrl = '/cloud/server'

export function queryCloudServerPage (cloudServerType, serverName, queryIp, serverStatus, page, length) {
  return request({
    url: baseUrl + '/page/query?cloudServerType=' + cloudServerType + '&serverName=' + serverName +
      '&queryIp=' + queryIp + '&serverStatus=' + serverStatus + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function queryCloudServerChargePage (data) {
  return request({
    url: baseUrl + '/charge/page/query',
    method: 'post',
    data
  })
}

export function syncCloudServerByKey (cloudServerKey) {
  return request({
    url: baseUrl + '/sync?key=' + cloudServerKey,
    method: 'get'
  })
}

export function deleteCloudServerById (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}

export function cloudServerPowerOn (data) {
  return request({
    url: baseUrl + '/power/on',
    method: 'post',
    data
  })
}

export function cloudServerPowerStatus (data) {
  return request({
    url: baseUrl + '/power/status',
    method: 'post',
    data
  })
}

export function syncCloudServerById (id) {
  return request({
    url: baseUrl + '/instance/sync?id=' + id,
    method: 'put'
  })
}

export function queryServerMonthStatsReport (queryYear) {
  return request({
    url: baseUrl + '/month/stats?queryYear=' + queryYear,
    method: 'get'
  })
}

export function queryServerMonthStatsReportByType (data) {
  return request({
    url: baseUrl + '/type/month/stats',
    method: 'post',
    data
  })
}

export function queryServerResStatsReport (cloudServerType) {
  return request({
    url: baseUrl + '/res/stats?cloudServerType=' + cloudServerType,
    method: 'get'
  })
}
