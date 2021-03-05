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

export function queryPrometheusConfig () {
  return request({
    url: baseUrl + '/config/query',
    method: 'get'
  })
}

export function savePrometheusConfig (data) {
  return request({
    url: baseUrl + '/config/save',
    method: 'post',
    data
  })
}

export function prometheusGroupConfigPreview (id) {
  return request({
    url: baseUrl + '/group/config/preview?id=' + id,
    method: 'get'
  })
}

export function getTargetMap (id) {
  return request({
    url: baseUrl + '/group/target/query?id=' + id,
    method: 'get'
  })
}
