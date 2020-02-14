import request from '@/plugin/axios'

export function queryPage (equalKey, page, length) {
  return request({
    url: '/rule/equal/query/page?equalKey=' + equalKey + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}
