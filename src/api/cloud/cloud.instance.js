import request from '@/plugin/axios'

export function fuzzyQueryCloudInstanceTemplatePage (data) {
  return request({
    url: '/cloud/instance/template/page/fuzzy/query',
    method: 'post',
    data
  })
}

