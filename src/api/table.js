import request from '@/utils/request'

export function getList(params) {
  return Promise.resolve()
  return request({
    url: '/table/list',
    method: 'get',
    params
  })
}
