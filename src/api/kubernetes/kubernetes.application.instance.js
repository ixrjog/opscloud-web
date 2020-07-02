import request from '@/plugin/axios'

const baseUrl = '/kubernetes/application/instance'

export function queryKubernetesApplicationInstancePage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function addKubernetesApplicationInstance (data) {
  return request({
    url: baseUrl + '/add',
    method: 'post',
    data
  })
}

export function updateKubernetesApplicationInstance (data) {
  return request({
    url: baseUrl + '/update',
    method: 'put',
    data
  })
}

export function delKubernetesApplicationInstanceById (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}

export function queryKubernetesApplicationInstanceLable (envType) {
  return request({
    url: baseUrl + '/label/query?envType=' + envType,
    method: 'get'
  })
}
