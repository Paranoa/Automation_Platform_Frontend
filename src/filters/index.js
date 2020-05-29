import { parseTime } from '@/utils'

export function parseToDate(time) {
  return parseTime(time, '{y}-{m}-{d}')
}

export function projectLevel(value) {
  return {
    1: '低',
    2: '中',
    3: '高'
  }[value] || ''
}

export function interfaceType(value) {
  return {
    1: '接口',
    2: '流程'
  }[value] || ''
}

export function httpProtocol(value) {
  return {
    1: 'http',
    2: 'https'
  }[value] || ''
}

export function httpMethod(value) {
  return {
    1: 'GET',
    2: 'POST',
    3: 'PUT',
    4: 'DELETE'
  }[value] || ''
}
