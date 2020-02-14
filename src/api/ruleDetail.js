import request from '@/plugin/axios'

export function addRuleDetail (data) {
  return request({
    url: '/rule/detail/add',
    method: 'post',
    data
  })
}

export function updateRuleDetail (data) {
  return request({
    url: '/rule/detail/update',
    method: 'put',
    data
  })
}

export function delById (ruleDetailId) {
  return request({
    url: '/rule/detail/del/id?ruleDetailId=' + ruleDetailId,
    method: 'delete'
  })
}

export function queryRulePage (businessId, targetDb, targetTable, page, length) {
  return request({
    url: '/rule/detail/query/page?businessId=' + businessId + '&targetDb=' + targetDb + '&targetTable=' + targetTable + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}
