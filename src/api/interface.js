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

export function getInterfaceList(params) {
  return request({
    url: 'interfacemanagement/interfaces/',
    method: 'get',
    params
  })
}

export function addInterface(data) {
  return request({
    url: 'interfacemanagement/interfaces/',
    method: 'post',
    data
  })
}

export function getAllKeyWords() {
  return request({
    url: 'interfacemanagement/keys/',
    method: 'get',
  })
}
