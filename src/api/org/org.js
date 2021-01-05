import request from '@/plugin/axios'

export function queryDepartmentPage (data) {
  return request({
    url: '/org/department/page/query',
    method: 'post',
    data
  })
}

export function queryDepartmentTree (parentId) {
  return request({
    url: '/org/department/tree/query?parentId=' + parentId,
    method: 'get'
  })
}

export function queryOrgChartByParentId (parentId) {
  return request({
    url: '/org/chart/query?parentId=' + parentId,
    method: 'get'
  })
}

export function dropDepartmentTree (draggingParentId, dropParentId, dropType) {
  return request({
    url: '/org/department/tree/drop?draggingParentId=' + draggingParentId + '&dropParentId=' + dropParentId + '&dropType=' + dropType,
    method: 'get'
  })
}

export function addDepartment (data) {
  return request({
    url: '/org/department/add',
    method: 'post',
    data
  })
}

export function updateDepartment (data) {
  return request({
    url: '/org/department/update',
    method: 'put',
    data
  })
}

export function queryDepartmentById (id) {
  return request({
    url: '/org/department/query?id=' + id,
    method: 'get'
  })
}

export function removeDepartmentById (id) {
  return request({
    url: '/org/department/del?id=' + id,
    method: 'delete'
  })
}

export function queryDepartmentMemberPage (data) {
  return request({
    url: '/org/department/member/page/query',
    method: 'post',
    data
  })
}

export function addDepartmentMember (departmentId, userId) {
  return request({
    url: '/org/department/member/add?departmentId=' + departmentId + '&userId=' + userId,
    method: 'put'
  })
}

export function joinDepartmentMember (departmentId) {
  return request({
    url: '/org/department/member/join?departmentId=' + departmentId,
    method: 'put'
  })
}

export function removeDepartmentMemberById (id) {
  return request({
    url: '/org/department/member/remove?id=' + id,
    method: 'delete'
  })
}

export function updateDepartmentMemberLeader (id) {
  return request({
    url: '/org/department/member/leader/update?id=' + id,
    method: 'put'
  })
}

export function updateDepartmentMemberApproval (id) {
  return request({
    url: '/org/department/member/approval/update?id=' + id,
    method: 'put'
  })
}

export function checkUserInTheDepartment () {
  return request({
    url: '/org/department/user/check',
    method: 'get'
  })
}

export function queryFirstLevelDepartmentPage (data) {
  return request({
    url: '/org/department/fl/page/query',
    method: 'post',
    data
  })
}

export function queryDepartmentTreeV2 () {
  return request({
    url: '/org/department/treeV2/query',
    method: 'get'
  })
}

export function refreshDepartmentTreeV2 () {
  return request({
    url: '/org/department/treeV2/refresh',
    method: 'get'
  })
}

export function queryOrgByUser (userId) {
  return request({
    url: '/org/department/user/query?userId=' + userId,
    method: 'get'
  })
}

export function queryOrgByUserV2 (userId) {
  return request({
    url: '/org/department/userV2/query?userId=' + userId,
    method: 'get'
  })
}

export function queryOrgPath (departmentId) {
  return request({
    url: '/org/department/path/query?departmentId=' + departmentId,
    method: 'get'
  })
}
