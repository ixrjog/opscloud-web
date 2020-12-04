import request from '@/plugin/axios'

const baseUrl = '/helpdesk'

export function helpdeskReportPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function saveHelpdeskReport (data) {
  return request({
    url: baseUrl + '/save',
    method: 'post',
    data
  })
}

export function delHelpdeskReport (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}
