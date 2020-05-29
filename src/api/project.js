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
    data
  })
}

export function updateProjectsStatus(data) {
  return request({
    url: `/projectmanagent/batch/status/`,
    method: 'put',
    data
  })
}

export function addProjectEnvServer(data) {
  return request({
    url: `/projectmanagent/projectserver/`,
    method: 'post',
    data
  })
}

export function updateProjectEnvServer(params, data) {
  return request({
    url: `/projectmanagent/projectserver/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteProjectEnvServer(params) {
  return request({
    url: `/projectmanagent/projectserver/${params.id}/`,
    method: 'delete'
  })
}

export function addProjectEnvDB(data) {
  return request({
    url: `/projectmanagent/projectdatabase/`,
    method: 'post',
    data
  })
}

export function updateProjectEnvDB(params, data) {
  return request({
    url: `/projectmanagent/projectdatabase/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteProjectEnvDB(params) {
  return request({
    url: `/projectmanagent/projectdatabase/${params.id}/`,
    method: 'delete'
  })
}

export function deleteProjects(data) {
  return request({
    url: '/projectmanagent/batch/delete/',
    method: 'put',
    data
  })
}

export function getProjectEnv(params) {
  return request({
    url: `/projectmanagent/project/env/`,
    method: 'get',
    params
  })
}

export function getEnvDetailByEnvId(params) {
  return request({
    url: `/projectmanagent/project/env/server/`,
    method: 'get',
    params
  })
}

export function addProjectEnv(data) {
  return request({
    url: `/projectmanagent/project/env/`,
    method: 'post',
    data
  })
}

export function updateProjectEnv(params, data) {
  return request({
    url: `/projectmanagent/project/env/${params.id}/`,
    method: 'put',
    data
  })
}

export function updateProjectEnvItem(params, data) {
  return request({
    url: `/projectmanagent/project/env/server/${params.id}/`,
    method: 'put',
    data
  })
}

export function addProjectEnvDetail(data) {
  return request({
    url: `/projectmanagent/project/env/server/`,
    method: 'post',
    data
  })
}

export function deleteProjectEnv(params) {
  return request({
    url: `/projectmanagent/project/env/${params.id}/`,
    method: 'delete'
  })
}

export function addProjectEnvTemplate(data) {
  return request({
    url: `/projectmanagent/project/template/`,
    method: 'post',
    data
  })
}

export function getProjectEnvTemplate(params) {
  return request({
    url: `/projectmanagent/project/template/?project=${params.id}`,
    method: 'get'
  })
}

export function updateProjectEnvTemplate(params, data) {
  return request({
    url: `/projectmanagent/project/template/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteProjectEnvTemplate(params) {
  return request({
    url: `/projectmanagent/project/template/${params.id}/`,
    method: 'delete'
  })
}
