import request from '@/plugin/axios'

const baseUrl = '/dashboard'

export function queryHelpDeskGroupByWeeks () {
  return request({
    url: baseUrl + '/helpdesk/report/query',
    method: 'get'
  })
}

export function refreshHelpDeskGroupByWeeks () {
  return request({
    url: baseUrl + '/helpdesk/report/refresh',
    method: 'get'
  })
}

export function queryHelpDeskGroupByTypes () {
  return request({
    url: baseUrl + '/helpdesk/type/query',
    method: 'get'
  })
}

export function refreshHelpDeskGroupByTypes () {
  return request({
    url: baseUrl + '/helpdesk/type/refresh',
    method: 'get'
  })
}
