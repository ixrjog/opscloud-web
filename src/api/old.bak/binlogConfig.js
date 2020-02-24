import request from '@/plugin/axios'

export function addBinlogConfig (data) {
  return request({
    url: '/binlog/config/add',
    method: 'post',
    data
  })
}

export function queryPage (topic, destination, schema, table, status, page, length) {
  return request({
    url: '/binlog/config/page/query?topic=' + topic + '&destination=' + destination + '&schema=' + schema + '&table=' + table + '&status=' + status + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function deleteById (binlogConfigId) {
  return request({
    url: '/binlog/config/del/id?binlogConfigId=' + binlogConfigId,
    method: 'delete'
  })
}

export function updateBinlogConfig (data) {
  return request({
    url: '/binlog/config/update',
    method: 'put',
    data
  })
}

export function updateBinlogConfigStatus (data) {
  return request({
    url: '/binlog/config/status/update',
    method: 'put',
    data
  })
}

export function queryAvailableTopicList () {
  return request({
    url: '/binlog/config/available/topic',
    method: 'get'
  })
}

export function queryAvailableDestinationList (topic) {
  return request({
    url: '/binlog/config/available/destination?topic=' + topic,
    method: 'get'
  })
}

export function queryAvailableSchemaList (topic, destination) {
  return request({
    url: '/binlog/config/available/schema?topic=' + topic + '&destination=' + destination,
    method: 'get'
  })
}

export function queryAvailableTableList (topic, destination, schema) {
  return request({
    url: '/binlog/config/available/table?topic=' + topic + '&destination=' + destination + '&schema=' + schema,
    method: 'get'
  })
}
