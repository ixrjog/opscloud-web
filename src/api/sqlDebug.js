import request from '@/plugin/axios'

export function addRuleDetailDebug (data) {
  return request({
    url: '/rule/detail/debug/add',
    method: 'post',
    data
  })
}

export function queryPage (data) {
  return request({
    url: '/rule/detail/debug/query/page',
    method: 'post',
    data
  })
}

export function queryDetailById (ruleDetailDebugId) {
  return request({
    url: '/rule/detail/debug/query/byId?ruleDetailDebugId=' + ruleDetailDebugId,
    method: 'get'
  })
}
