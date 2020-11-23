import request from '@/plugin/axios'

const baseUrl = '/dashboard'

export function queryHelpDeskGroupByWeeks () {
  return request({
    url: baseUrl + '/helpdesk/report/query',
    method: 'get'
  })
}

export function queryHelpDeskGroupByTypes () {
  return request({
    url: baseUrl + '/helpdesk/type/query',
    method: 'get'
  })
}
