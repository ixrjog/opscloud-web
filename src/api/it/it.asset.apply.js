import request from '@/plugin/axios'

const baseUrl = '/it/asset/apply'

export function queryOcItAssetApplyPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function updateAssetApply (data) {
  return request({
    url: baseUrl + '/update',
    method: 'put',
    data
  })
}

export function exportItAssetApply () {
  return request({
    url: baseUrl + '/export',
    method: 'get'
  })
}
