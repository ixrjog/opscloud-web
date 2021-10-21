import request from '@/plugin/axios'

const baseUrl = '/aliyun/ons/group'

export function queryONSGroupPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function syncONSGroup (data) {
  return request({
    url: baseUrl + '/sync',
    method: 'post',
    data
  })
}

export function queryOnsGroupSubDetail (data) {
  return request({
    url: baseUrl + '/sub/query',
    method: 'post',
    data
  })
}

export function onsGroupCreate (data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function onsGroupCheck (data) {
  return request({
    url: baseUrl + '/check',
    method: 'post',
    data
  })
}

export function onsGroupCheckV2 (groupID) {
  return request({
    url: baseUrl + '/checkV2?groupId=' + groupID,
    method: 'get'
  })
}

export function onsGroupStatus (data) {
  return request({
    url: baseUrl + '/status',
    method: 'post',
    data
  })
}

export function saveONSGroupAlarm (data) {
  return request({
    url: baseUrl + '/alarm/save',
    method: 'post',
    data
  })
}

export function queryONSGroupAlarm (onsGroupId) {
  return request({
    url: baseUrl + '/alarm/query?onsGroupId=' + onsGroupId,
    method: 'get'
  })
}

export function queryOnsDLQMessage (data) {
  return request({
    url: baseUrl + '/dlq/message/query',
    method: 'post',
    data
  })
}

export function resendOnsDLQMessage (data) {
  return request({
    url: baseUrl + '/dlq/message/resend',
    method: 'post',
    data
  })
}
