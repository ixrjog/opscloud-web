import request from '@/plugin/axios'

const baseUrl = '/aliyun/ons/topic'

export function queryONSTopicPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function syncONSTopic (data) {
  return request({
    url: baseUrl + '/sync',
    method: 'post',
    data
  })
}

export function queryOnsTopicSubDetail (data) {
  return request({
    url: baseUrl + '/sub/query',
    method: 'post',
    data
  })
}

export function onsTopicCreate (data) {
  return request({
    url: baseUrl + '/create',
    method: 'post',
    data
  })
}

export function onsTopicCheck (data) {
  return request({
    url: baseUrl + '/check',
    method: 'post',
    data
  })
}

export function onsMessagePageQuery (data) {
  return request({
    url: baseUrl + '/msg/page/query',
    method: 'post',
    data
  })
}

export function queryOnsMessage (data) {
  return request({
    url: baseUrl + '/msg/query',
    method: 'post',
    data
  })
}

export function queryOnsTrace (data) {
  return request({
    url: baseUrl + '/msg/trace/query',
    method: 'post',
    data
  })
}
