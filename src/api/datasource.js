import request from '@/utils/request'

export function getDatasourceList(params) {
  return request({
    url: '/datasource/sources/',
    method: 'get',
    params
  })
}

export function deleteDatasource(data) {
  return request({
    url: 'datasource/sources/',
    method: 'delete',
    data
  })
}

export function updateDatasource(params, data) {
  return request({
    url: `/datasource/sources/${params.id}/`,
    method: 'put',
    data
  })
}
