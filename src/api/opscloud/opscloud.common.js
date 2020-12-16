import request from '@/plugin/axios'

const baseUrl = '/opscloud/common'

export function chineseToPinYin (data) {
  return request({
    url: baseUrl + '/topinyin',
    method: 'post',
    data
  })
}
