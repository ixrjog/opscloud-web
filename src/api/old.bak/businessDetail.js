import request from '@/plugin/axios'

export function addBusinessDetail (data) {
  return request({
    url: '/business/detail/add',
    method: 'post',
    data
  })
}

export function updateBusinessDetail (data) {
  return request({
    url: '/business/detail/update',
    method: 'put',
    data
  })
}

export function delById (businessId) {
  return request({
    url: '/business/detail/del/id?businessId=' + businessId,
    method: 'delete'
  })
}

export function queryBusinessDetailPage (page, length) {
  return request({
    url: '/business/detail/query/page?page=' + page + '&length=' + length,
    method: 'get'
  })
}
