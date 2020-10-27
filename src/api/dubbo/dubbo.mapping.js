import request from '@/plugin/axios'

const baseUrl = '/dubbo/mapping'

export function refreshDubboMappingByEnv (env) {
  return request({
    url: baseUrl + '/refresh?env=' + env,
    method: 'get'
  })
}
