import request from '@/utils/request'

export function getTimedtask(params) {
  return request({
    url: '/interfacemanagement/timedtask/',
    method: 'get',
    params
  })
}

export function addTimedtask(data) {
  return request({
    url: '/interfacemanagement/timedtask/',
    method: 'post',
    data
  })
}

export function deleteTimedtask(data) {
  return request({
    url: '/interfacemanagement/timedtask/',
    method: 'delete',
    data
  })
}

