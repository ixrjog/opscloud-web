import request from '@/plugin/axios'

export function executorCommand (data) {
  return request({
    url: '/server/task/command/executor',
    method: 'post',
    data
  })
}

export function executorPlaybook (data) {
  return request({
    url: '/server/task/playbook/executor',
    method: 'post',
    data
  })
}

export function executorScript (data) {
  return request({
    url: '/server/task/script/executor',
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

export function abortServerTaskById (taskId) {
  return request({
    url: '/server/task/abort?taskId=' + taskId,
    method: 'get'
  })
}

export function abortServerTaskMemberById (memberId) {
  return request({
    url: '/server/task/member/abort?memberId=' + memberId,
    method: 'get'
  })
}

export function queryPlaybookPage (data) {
  return request({
    url: '/server/task/playbook/page/query',
    method: 'post',
    data
  })
}

export function addPlaybook (data) {
  return request({
    url: '/server/task/playbook/add',
    method: 'post',
    data
  })
}

export function updatePlaybook (data) {
  return request({
    url: '/server/task/playbook/update',
    method: 'put',
    data
  })
}

export function delPlaybookById (id) {
  return request({
    url: '/server/task/playbook/del?id=' + id,
    method: 'delete'
  })
}

export function queryScriptPage (data) {
  return request({
    url: '/server/task/script/page/query',
    method: 'post',
    data
  })
}
