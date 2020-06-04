import request from '@/plugin/axios'

export function querySettingMapByName (name) {
  return request({
    url: '/setting/query?name=' + name,
    method: 'get'
  })
}
