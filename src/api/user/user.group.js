import request from '@/plugin/axios'

/**
 * 用户名查询
 * @param username
 * @param page
 * @param length
 * @returns {AxiosPromise}
 */
export function queryUserGroupPage (name, grpType, workflow, page, length) {
  return request({
    url: '/user/group/page/query?name=' + name + '&grpType=' + grpType + '&workflow=' + workflow + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function addUserGroup (data) {
  return request({
    url: '/user/group/add',
    method: 'post',
    data
  })
}

export function updateUserGroup (data) {
  return request({
    url: '/user/group/update',
    method: 'put',
    data
  })
}

export function deleteUserGroupById (id) {
  return request({
    url: '/user/group/del?id=' + id,
    method: 'delete'
  })
}

export function syncUserGroup () {
  return request({
    url: '/user/group/ldap/sync',
    method: 'get'
  })
}
