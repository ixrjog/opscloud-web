import request from '@/plugin/axios'

const baseUrl = '/kafka/topic'

export function kafkaTopicCheck (topic) {
  return request({
    url: baseUrl + '/check?topic=' + topic,
    method: 'get'
  })
}
