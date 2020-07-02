import request from '@/plugin/axios'

const baseUrl = '/kubernetes/service'

export function queryKubernetesServicePage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function delKubernetesServiceById (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}
