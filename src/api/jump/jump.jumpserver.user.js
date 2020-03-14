import request from '@/plugin/axios'

/**
 * 模糊查询
 * @param data
 * @returns {AxiosPromise}
 */
export function fuzzyQueryUserPage (data) {
  return request({
    url: '/jump/jumpserver/user/page/fuzzy/query',
    method: 'post',
    data
  })
}

export function syncUser () {
  return request({
    url: '/jump/jumpserver/user/sync',
    method: 'get'
  })
}

export function setUserActive (id) {
  return request({
    url: '/jump/jumpserver/user/active/set?id=' + id,
    method: 'get'
  })
}

/**
 * 查询管理员/普通用户
 * @param data
 * @returns {AxiosPromise}
 */
export function fuzzyQueryAdminUserPage (data) {
  return request({
    url: '/jump/jumpserver/user/admin/page/fuzzy/query',
    method: 'post',
    data
  })
}
