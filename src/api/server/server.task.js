import request from '@/plugin/axios'

export function executorCommand (data) {
  return request({
    url: '/server/task/command/executor',
    method: 'post',
    data
  })
}

export function queryServerTaskById (taskId) {
  return request({
    url: '/server/task/query?taskId=' + taskId,
    method: 'get'
  })
}

export function createAnsibleHosts () {
  return request({
    url: '/server/task/ansible/hosts/create',
    method: 'get'
  })
}
