import request from '@/plugin/axios'

export function queryKubernetesTemplatePage (data) {
  return request({
    url: '/kubernetes/template/page/query',
    method: 'post',
    data
  })
}

export function addKubernetesTemplate (data) {
  return request({
    url: '/kubernetes/template/add',
    method: 'post',
    data
  })
}

export function updateKubernetesTemplate (data) {
  return request({
    url: '/kubernetes/template/update',
    method: 'put',
    data
  })
}

export function delKubernetesTemplateById (id) {
  return request({
    url: '/kubernetes/template/del?id=' + id,
    method: 'delete'
  })
}
