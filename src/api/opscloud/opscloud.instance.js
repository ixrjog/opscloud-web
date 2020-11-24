import request from '@/plugin/axios'

const baseUrl = '/opscloud/instance'

export function queryOpscloudInstancePage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function delOpscloudInstanceById (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}

export function setOpscloudInstanceActive (id) {
  return request({
    url: baseUrl + '/active/set?id=' + id,
    method: 'get'
  })
}
