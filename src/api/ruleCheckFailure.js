import request from '@/plugin/axios'

export function queryPage (equalKey, page, length) {
  return request({
    url: '/rule/check/failure/page/query?equalKey=' + equalKey + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}
