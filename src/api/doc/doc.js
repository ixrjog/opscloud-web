import request from '@/plugin/axios'

export function queryDocByKey (key) {
  return request({
    url: '/doc/key/query?key=' + key,
    method: 'get'
  })
}
