import request from '@/utils/request'

export function getAllModules(params) {
  return request({
    url: '/interfacemanagement/modules/',
    method: 'get',
    params
  })
}

export function addModule(data) {
  return request({
    url: '/interfacemanagement/modules/',
    method: 'post',
    data
  })
}

export function updateModule(params, data) {
  return request({
    url: `/interfacemanagement/modules/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteModule(params, data) {
  return request({
    url: `/interfacemanagement/modules/${params.id}/`,
    method: 'delete',
    data
  })
}

export function getInterfaceList(params) {
  return request({
    url: '/interfacemanagement/interfaces/',
    method: 'get',
    params
  })
}

export function getInterfaceInfo(params) {
  return request({
    url: `/interfacemanagement/interfaces/${params.id}/`,
    method: 'get'
  })
}

export function addInterface(data) {
  return request({
    url: '/interfacemanagement/interfaces/',
    method: 'post',
    data
  })
}

export function updateInterface(params, data) {
  return request({
    url: `/interfacemanagement/interfaces/${params.id}/`,
    method: 'put',
    data
  })
}

export function deleteInterface(data) {
  return request({
    url: `/interfacemanagement/interfaces/`,
    method: 'delete',
    data
  })
}

export function getAllKeyWords() {
  return request({
    url: '/interfacemanagement/keys/',
    method: 'get'
  })
}

export function getExcelByInterface(pathParams, params) {
  return request({
    url: `/interfacemanagement/interfaces/case/${pathParams.id}/`,
    method: 'get',
    params
  })
}

export function excuteInterface(data) {
  return request({
    url: '/interfacemanagement/interfaces/execute/',
    method: 'post',
    data
  })
}

export function terminateExcuteInterface(data) {
  return request({
    url: '/interfacemanagement/interfaces/end/',
    method: 'post',
    data
  })
}

export function excuteInterfaceResult(params) {
  return request({
    url: `/interfacemanagement/execute/result/${params.id}/`,
    method: 'get'
  })
}

export function updateAccessories(data) {
  return request({
    url: 'interfacemanagement/interfaces/accessories/',
    method: 'post',
    data
  })
}

export function deleteAccessories(data) {
  return request({
    url: `/interfacemanagement/interfaces/accessories/`,
    method: 'delete',
    data
  })
}

export function getAccessories(params) {
  return request({
    url: '/interfacemanagement/interfaces/accessories/',
    method: 'get',
    params
  })
}
