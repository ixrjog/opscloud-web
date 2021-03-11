import request from '@/plugin/axios'

const baseUrl = '/prometheus'

export function prometheusConfigCreate () {
  return request({
    url: baseUrl + '/config/create',
    method: 'get'
  })
}

export function prometheusConfigPreview () {
  return request({
    url: baseUrl + '/config/preview',
    method: 'get'
  })
}
