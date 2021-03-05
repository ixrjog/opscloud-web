import request from '@/plugin/axios'

const baseURL = '/export/task'

export function queryOcExportTaskPage (data) {
  return request({
    url: baseURL + '/page/query',
    method: 'post',
    data
  })
}
