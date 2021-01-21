import request from '@/plugin/axios'

const baseURL = '/fault/info'

export function queryFaultInfoPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function saveFaultInfo (data) {
  return request({
    url: baseURL + '/save',
    method: 'post',
    data
  })
}

export function addRootCauseType (data) {
  return request({
    url: baseURL + '/cause/type/add',
    method: 'post',
    data
  })
}

export function updateFaultAction (data) {
  return request({
    url: baseURL + '/action/update',
    method: 'post',
    data
  })
}

export function delFaultInfo (id) {
  return request({
    url: baseURL + '/del?id=' + id,
    method: 'delete'
  })
}

export function queryFaultRootCauseTypePage (data) {
  return request({
    url: baseURL + '/cause/type/query',
    method: 'post',
    data
  })
}

export function updateFaultInfoFinalized (id) {
  return request({
    url: baseURL + '/finalized/update?id=' + id,
    method: 'get'
  })
}

export function queryFaultInfo (id) {
  return request({
    url: baseURL + '/query?id=' + id,
    method: 'get'
  })
}

export function queryFaultInfoMonthStats (year) {
  return request({
    url: baseURL + '/month/stats?year=' + year,
    method: 'get'
  })
}

export function queryFaultActionPage (data) {
  return request({
    url: baseURL + '/action/page/query',
    method: 'post',
    data
  })
}
