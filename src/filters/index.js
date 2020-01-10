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