import request from '@/plugin/axios'

export function queryKubernetesServicePage (data) {
  return request({
    url: '/kubernetes/service/page/query',
    method: 'post',
    data
  })
}

export function delKubernetesServiceById (id) {
  return request({
    url: '/kubernetes/service/del?id=' + id,
    method: 'delete'
  })
}
