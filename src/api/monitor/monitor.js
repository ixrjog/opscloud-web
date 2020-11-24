import request from '@/plugin/axios'

const baseUrl = '/monitor'

export function queryMonitorHostPage (data) {
  return request({
    url: baseUrl + '/host/page/query',
    method: 'post',
    data
  })
}

export function syncMonitorHostStatus () {
  return request({
    url: baseUrl + '/host/status/sync',
    method: 'get'
  })
}
