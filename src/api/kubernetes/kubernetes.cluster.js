import request from '@/plugin/axios'

export function queryKubernetesClusterPage (data) {
  return request({
    url: '/kubernetes/cluster/page/query',
    method: 'post',
    data
  })
}

export function addKubernetesCluster (data) {
  return request({
    url: '/kubernetes/cluster/add',
    method: 'post',
    data
  })
}

export function updateKubernetesCluster (data) {
  return request({
    url: '/kubernetes/cluster/update',
    method: 'put',
    data
  })
}

export function delKubernetesClusterById (id) {
  return request({
    url: '/kubernetes/cluster/del?id=' + id,
    method: 'delete'
  })
}

export function queryKubernetesClusterNamespacePage (data) {
  return request({
    url: '/kubernetes/cluster/namespace/page/query',
    method: 'post',
    data
  })
}

export function delKubernetesClusterNamespaceById (id) {
  return request({
    url: '/kubernetes/cluster/namespace/del?id=' + id,
    method: 'delete'
  })
}

export function queryKubernetesExcludeNamespace (data) {
  return request({
    url: '/kubernetes/cluster/namespace/exclude/query',
    method: 'post',
    data
  })
}
