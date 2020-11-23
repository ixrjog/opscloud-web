import request from '@/plugin/axios'

const baseUrl = '/it/asset'

export function queryOcItAssetPage (data) {
  return request({
    url: baseUrl + '/page/query',
    method: 'post',
    data
  })
}

export function queryAssetTypeTree () {
  return request({
    url: baseUrl + '/type/tree/query',
    method: 'get'
  })
}

export function queryOcItAssetTypeList () {
  return request({
    url: baseUrl + '/type/query',
    method: 'get'
  })
}

export function addAssetName (data) {
  return request({
    url: baseUrl + '/name/add',
    method: 'post',
    data
  })
}

export function saveAsset (data) {
  return request({
    url: baseUrl + '/save',
    method: 'post',
    data
  })
}

export function applyAsset (data) {
  return request({
    url: baseUrl + '/apply',
    method: 'post',
    data
  })
}

export function returnAsset (data) {
  return request({
    url: baseUrl + '/return',
    method: 'post',
    data
  })
}

export function disableAsset (id) {
  return request({
    url: baseUrl + '/disable?id=' + id,
    method: 'get'
  })
}

export function ableAsset (id) {
  return request({
    url: baseUrl + '/able?id=' + id,
    method: 'get'
  })
}

export function queryOcItAssetCompanyAll () {
  return request({
    url: baseUrl + '/company/all/query',
    method: 'get'
  })
}

export function assetCodeCheck (assetCode) {
  return request({
    url: baseUrl + '/code/check?assetCode=' + assetCode,
    method: 'get'
  })
}
