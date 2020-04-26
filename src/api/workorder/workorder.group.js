import request from '@/plugin/axios'

export function queryWorkorderGroupPage (data) {
  return request({
    url: '/workorder/group/page/query',
    method: 'post',
    data
  })
}

export function deleteWorkorderGroupById (id) {
  return request({
    url: '/workorder/group/del?id=' + id,
    method: 'delete'
  })
}
