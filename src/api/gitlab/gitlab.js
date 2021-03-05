import request from '@/plugin/axios'

const baseURL = '/gitlab'

export function queryGitlabInstance (queryName) {
  return request({
    url: baseURL + '/instance/page/query?queryName=' + queryName,
    method: 'get'
  })
}

export function queryGitlabGroupPage (data) {
  return request({
    url: baseURL + '/group/page/query',
    method: 'post',
    data
  })
}
