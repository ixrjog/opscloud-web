import request from '@/plugin/axios'

export function queryResourcePage (resourceName, needAuth, page, length) {
  return request({
    url: '/auth/resource/page/query?resourceName=' + resourceName + '&needAuth=' + needAuth + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function addResource (data) {
  return request({
    url: '/auth/resource/add',
    method: 'post',
    data
  })
}

export function deleteResourceById (id) {
  return request({
    url: '/auth/resource/del?id=' + id,
    method: 'delete'
  })
}

export function updateResource (data) {
  return request({
    url: '/auth/resource/update',
    method: 'put',
    data
  })
}
