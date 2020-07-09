import request from '@/plugin/axios'

const baseUrl = '/profile/subscription'

export function queryProfileSubscriptionPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function delProfileSubscriptionById (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}
