import request from '@/plugin/axios'

const baseURL = '/aliyun/slb/acl'

export function queryAccessControlPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function syncSLBACL () {
  return request({
    url: baseURL + '/sync',
    method: 'get'
  })
}

export function queryAccessControlEntry (slbAclId) {
  return request({
    url: baseURL + '/entry/query?slbAclId=' + slbAclId,
    method: 'get'
  })
}
