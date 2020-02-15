import request from '@/plugin/axios'

export function queryGroupPage (groupCode, page, length) {
  return request({
    url: '/auth/group/page/query?groupCode=' + groupCode + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}
