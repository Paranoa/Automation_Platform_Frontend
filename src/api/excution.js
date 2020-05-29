import request from '@/utils/request'

export function getExcutionSet(params) {
  return request({
    url: '/executionsetmanagement/executiontset/',
    method: 'get',
    params
  })
}

export function addExcutionSet(data) {
  return request({
    url: '/executionsetmanagement/executiontset/',
    method: 'post',
    data
  })
}

export function updateExcutionSet(params, data) {
  return request({
    url: `/executionsetmanagement/executiontset/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteExcutionSet(params) {
  return request({
    url: `/executionsetmanagement/executiontset/${params.id}/`,
    method: 'delete'
  })
}

export function getExcutionInterface(pathParams, params) {
  return request({
    url: `/executionsetmanagement/executiontset/${pathParams.id}/`,
    method: 'get',
    params
  })
}
