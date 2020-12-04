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

export function refreshAssetTypeTree () {
  return request({
    url: baseUrl + '/type/tree/refresh',
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

export function disposeAsset (data) {
  return request({
    url: baseUrl + '/dispose',
    method: 'post',
    data
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

export function queryOcItAssetNameAll () {
  return request({
    url: baseUrl + '/name/all/query',
    method: 'get'
  })
}

export function assetCodeCheck (assetCode) {
  return request({
    url: baseUrl + '/code/check?assetCode=' + assetCode,
    method: 'get'
  })
}

export function updateReturnAsset (data) {
  return request({
    url: baseUrl + '/return/update',
    method: 'put',
    data
  })
}

export function queryOcItAssetDisposePage (data) {
  return request({
    url: baseUrl + '/dispose/page/query',
    method: 'post',
    data
  })
}

export function queryItAssetStatistics () {
  return request({
    url: baseUrl + '/stats',
    method: 'get'
  })
}

export function queryItAssetTotalStats () {
  return request({
    url: baseUrl + '/total/stats',
    method: 'get'
  })
}

export function queryItAssetMonthStatistics () {
  return request({
    url: baseUrl + '/month/stats',
    method: 'get'
  })
}

export function refreshAssetMonthStatistics () {
  return request({
    url: baseUrl + '/month/stats/refresh',
    method: 'get'
  })
}
