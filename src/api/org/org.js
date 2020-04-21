import request from '@/plugin/axios'

export function queryDepartmentTree (parentId) {
  return request({
    url: '/org/department/tree/query?parentId=' + parentId,
    method: 'get'
  })
}

export function dropDepartmentTree (draggingParentId, dropParentId, dropType) {
  return request({
    url: '/org/department/tree/drop?draggingParentId=' + draggingParentId + '&dropParentId=' + dropParentId + '&dropType=' + dropType,
    method: 'get'
  })
}

export function queryDepartmentMemberPage (data) {
  return request({
    url: '/org/department/member/page/query',
    method: 'post',
    data
  })
}
