import request from '@/plugin/axios'

const baseUrl = '/tencent/exmail/user'

export function createUserMail (data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function checkUser (userId) {
  return request({
    url: baseUrl + '/check?userId=' + userId,
    method: 'get'
  })
}
