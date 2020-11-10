import request from '@/utils/request'

export function register(data) {
  return request({
    url: '/user/register/',
    method: 'post',
    data
  })
}

export function login(data) {
  return request({
    url: '/user/authorization/',
    method: 'post',
    data
  })
}

export function logout() {
  return Promise.resolve()
  // return request({
  //   url: '/user/logout',
  //   method: 'post'
  // })
}

export function getUserInfo() {
  return request({
    url: '/user/userinfo/',
    method: 'get'
  })
}

export function getAllUsers() {
  return request({
    url: '/user/users/',
    method: 'get'
  })
}

export function refreshToken() {
  return request({
    url: '/user/authorization/',
    method: 'put'
  })
}

export function getExecutor() {
  return request({
    url: '/interfacemanagement/actuator/',
    method: 'get'
  })
}
