import request from '@/plugin/axios'

const baseUrl = '/kafka/group'

export function kafkaGroupCheck (consumerId) {
  return request({
    url: baseUrl + '/check?consumerId=' + consumerId,
    method: 'get'
  })
}
