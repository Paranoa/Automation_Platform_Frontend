import request from '@/utils/request'

export function getExecutionSet(params) {
  return request({
    url: '/executionsetmanagement/executiontset/',
    method: 'get',
    params
  })
}

export function addExecutionSet(data) {
  return request({
    url: '/executionsetmanagement/executiontset/',
    method: 'post',
    data
  })
}

export function updateExecutionSet(params, data) {
  return request({
    url: `/executionsetmanagement/executiontset/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteExecutionSet(params) {
  return request({
    url: `/executionsetmanagement/executiontset/${params.id}/`,
    method: 'delete'
  })
}

export function getExecutionInterface(pathParams, params) {
  return request({
    url: `/executionsetmanagement/executiontset/${pathParams.id}/`,
    method: 'get',
    params
  })
}
