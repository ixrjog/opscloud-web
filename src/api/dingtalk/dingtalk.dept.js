import request from '@/plugin/axios'

const baseURL = '/dingtalk/dept'

export function syncDept (uid) {
  return request({
    url: baseURL + '/sync?uid=' + uid,
    method: 'get'
  })
}

export function queryDingtalkDeptTree (uid) {
  return request({
    url: baseURL + '/tree/query?uid=' + uid,
    method: 'get'
  })
}

export function refreshDingtalkDeptTree (uid) {
  return request({
    url: baseURL + '/tree/refresh?uid=' + uid,
    method: 'get'
  })
}
