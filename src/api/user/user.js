import request from '@/plugin/axios'

export function queryUserPage (username, page, length) {
  return request({
    url: '/user/page/query?username=' + username + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}
