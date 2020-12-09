import request from '@/plugin/axios'

const baseUrl = '/monitor/user'

export function queryMonitorUserPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function syncMonitorUsers () {
  return request({
    url: baseUrl + '/sync',
    method: 'get'
  })
}
