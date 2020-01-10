import request from '@/utils/request'

export function getProjectList(params) {
  return request({
    url: '/projectmanagent/obtain/',
    method: 'get',
    params
  })
}

export function addProject(data) {
  return request({
    url: '/projectmanagent/operation/',
    method: 'post',
    data
  })
}

export function updateProject(data) {
  return request({
    url: `/projectmanagent/operation/${data.id}/`,
    method: 'put',
    data,
  })
}

export function updateProjectsStatus(data) {
  return request({
    url: `/projectmanagent/batch/status/`,
    method: 'put',
    data,
  })
}

export function addProjectEnv(params, data) {
  console.log(params, data)
  return request({
    url: `/projectmanagent/projectenv/${params.env}/${params.envid}/`,
    method: 'put',
    data,
  })
}

export function deleteProjects(data) {
  return request({
    url: '/projectmanagent/batch/delete/',
    method: 'put',
    data
  })
}
