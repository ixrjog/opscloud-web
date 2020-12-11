import request from '@/plugin/axios'

const baseURL = '/aliyun/slb/sc'

export function queryAliyunSlbSCPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function syncSLBSC () {
  return request({
    url: baseURL + '/sync',
    method: 'get'
  })
}

export function setUpdateSC (data) {
  return request({
    url: baseURL + '/set',
    method: 'post',
    data
  })
}

export function replaceSC (data) {
  return request({
    url: baseURL + '/replace',
    method: 'post',
    data
  })
}
