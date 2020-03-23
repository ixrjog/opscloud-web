import request from '@/plugin/axios'

export function fuzzyQueryCloudVPCPage (data) {
  return request({
    url: '/cloud/vpc/page/fuzzy/query',
    method: 'post',
    data
  })
}

export function syncCloudVPCByKey (cloudVPCKey) {
  return request({
    url: '/cloud/vpc/sync?key=' + cloudVPCKey,
    method: 'get'
  })
}

export function deleteCloudVPCById (id) {
  return request({
    url: '/cloud/vpc/del?id=' + id,
    method: 'delete'
  })
}

export function setCloudVPCActiveById (id) {
  return request({
    url: '/cloud/vpc/active/set?id=' + id,
    method: 'put'
  })
}
