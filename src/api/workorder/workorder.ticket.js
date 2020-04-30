import request from '@/plugin/axios'

export function createWorkorderTicket (data) {
  return request({
    url: '/workorder/ticket/create',
    method: 'post',
    data
  })
}

export function queryUserTicketServerGroupPage (data) {
  return request({
    url: '/workorder/ticket/server/group/query',
    method: 'post',
    data
  })
}

export function addWorkorderTicketEntry (data) {
  return request({
    url: '/workorder/ticket/entry/add',
    method: 'post',
    data
  })
}

export function updateWorkorderTicketEntry (data) {
  return request({
    url: '/workorder/ticket/entry/update',
    method: 'post',
    data
  })
}

export function queryWorkorderTicket (id) {
  return request({
    url: '/workorder/ticket/query?id=' + id,
    method: 'get'
  })
}

export function delWorkorderTicketEntryById (id) {
  return request({
    url: '/workorder/ticket/entry/del?id=' + id,
    method: 'delete'
  })
}
