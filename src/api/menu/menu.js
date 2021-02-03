import request from '@/plugin/axios'

const baseUrl = '/menu'

export function saveMenuList (data) {
  return request({
    url: baseUrl + '/list/save',
    method: 'post',
    data
  })
}

export function saveSubmenuList (data) {
  return request({
    url: baseUrl + '/sub/list/save',
    method: 'post',
    data
  })
}

export function delMenu (id) {
  return request({
    url: baseUrl + '/del?id=' + id,
    method: 'delete'
  })
}

export function delSubmenu (id) {
  return request({
    url: baseUrl + '/sub/del?id=' + id,
    method: 'delete'
  })
}

export function queryMenuAll () {
  return request({
    url: baseUrl + '/all/query',
    method: 'get'
  })
}

export function querySubmenuByMenuId (menuId) {
  return request({
    url: baseUrl + '/sub/list/query?menuId=' + menuId,
    method: 'get'
  })
}

export function queryMenuListTree () {
  return request({
    url: baseUrl + '/list/tree',
    method: 'get'
  })
}

export function saveRoleMenu (data) {
  return request({
    url: baseUrl + '/role/save',
    method: 'post',
    data
  })
}

export function queryRoleMenu (roleId) {
  return request({
    url: baseUrl + '/role/query?roleId=' + roleId,
    method: 'get'
  })
}

export function queryRoleMenuTemp (roleId) {
  return request({
    url: baseUrl + '/role/temp/query?roleId=' + roleId,
    method: 'get'
  })
}
