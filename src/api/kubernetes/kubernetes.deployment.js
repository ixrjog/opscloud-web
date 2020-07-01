import request from '@/plugin/axios'

export function queryKubernetesDeploymentPage (data) {
  return request({
    url: '/kubernetes/deployment/page/query',
    method: 'post',
    data
  })
}

export function delKubernetesDeploymentById (id) {
  return request({
    url: '/kubernetes/deployment/del?id=' + id,
    method: 'delete'
  })
}
