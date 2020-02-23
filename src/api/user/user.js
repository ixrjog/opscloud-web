import request from '@/plugin/axios'

/**
 * 用户名查询
 * @param username
 * @param page
 * @param length
 * @returns {AxiosPromise}
 */
export function queryUserPage (username, page, length) {
  return request({
    url: '/user/page/query?username=' + username + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

/**
 * 模糊查询
 * @param data
 * @returns {AxiosPromise}
 */
export function fuzzyQueryUserPage (data) {
  return request({
    url: '/user/page/fuzzy/query',
    method: 'post',
    data
  })
}

export function addUser (data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export function updateUser (data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

export function deleteUserById (id) {
  return request({
    url: '/user/del?id=' + id,
    method: 'delete'
  })
}

export function getRandomPassword () {
  return request({
    url: '/user/password/random',
    method: 'get'
  })
}
