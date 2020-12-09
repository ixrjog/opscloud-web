import request from '@/plugin/axios'

const baseURL = '/aliyun/domain'

export function queryAliyunDomainPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function setAliyunDomainActive (data) {
  return request({
    url: baseURL + '/active/set',
    method: 'put',
    data
  })
}

export function syncAliyunDomain (id) {
  return request({
    url: baseURL + '/sync',
    method: 'get'
  })
}


