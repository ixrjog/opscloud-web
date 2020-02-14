import request from '@/plugin/axios'

export function addBusinessRule (data) {
  return request({
    url: '/business/rule/add',
    method: 'post',
    data
  })
}

export function updateBusinessRule (data) {
  return request({
    url: '/business/rule/update',
    method: 'put',
    data
  })
}

export function delById (businessRuleId) {
  return request({
    url: '/business/rule/del/id?businessRuleId=' + businessRuleId,
    method: 'delete'
  })
}

export function queryById (businessRuleId) {
  return request({
    url: 'business/rule/query/id?businessRuleId=' + businessRuleId,
    method: 'get'
  })
}

export function queryPage (businessId, page, length) {
  return request({
    url: '/business/rule/query/page?businessId=' + businessId + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}
