import request from '@/plugin/axios'

const baseURL = '/anc'

export function queryOcAnnouncementPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}

export function delAnnouncement (id) {
  return request({
    url: baseURL + '/del?id=' + id,
    method: 'delete'
  })
}

export function saveAnnouncement (data) {
  return request({
    url: baseURL + '/save',
    method: 'post',
    data
  })
}

export function queryValidOcAnnouncement () {
  return request({
    url: baseURL + '/valid/query',
    method: 'get'
  })
}
