import request from '@/plugin/axios'

const baseURL = '/dingtalk/user'

export function queryDingtalkUserPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function syncUser () {
  return request({
    url: baseURL + '/sync',
    method: 'get'
  })
}

export function bindOcUser (data) {
  return request({
    url: baseURL + '/bind',
    method: 'post',
    data
  })
}
