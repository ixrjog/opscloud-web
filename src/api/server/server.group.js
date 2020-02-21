import request from '@/plugin/axios'

export function queryServerGroupPage (name, grpType, page, length) {
  return request({
    url: '/server/group/page/query?name=' + name + '&grpType=' + grpType + '&page=' + page + '&length=' + length,
    method: 'get'
  })
}

export function addServerGroup (data) {
  return request({
    url: '/server/group/add',
    method: 'post',
    data
  })
}

export function deleteServerGroupById (id) {
  return request({
    url: '/server/group/del?id=' + id,
    method: 'delete'
  })
}

export function updateServerGroup (data) {
  return request({
    url: '/server/group/update',
    method: 'put',
    data
  })
}
