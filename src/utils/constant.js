export const optionsProtocol = [{ label: 'http', value: 1 }, { label: 'https', value: 2 }]

export const optionsBodyRayType = [
  { label: 'Text', value: 1 },
  { label: 'Javascript', value: 2 },
  { label: 'JSON', value: 3 },
  { label: 'HTML', value: 4 },
  { label: 'XML', value: 5 }
]

export const optionsHttpMethod = [
  { label: 'GET', value: 1 },
  { label: 'POST', value: 2 },
  { label: 'PUT', value: 3 },
  { label: 'DELETE', value: 4 },
  { label: 'PATCH', value: 5 }
]

export const optionsBodyType = [
  { label: 'form-data', value: 1 },
  { label: 'x-www-form-urlencoded-data', value: 2 },
  { label: 'raw-data', value: 3 },
  { label: 'binary', value: 4 }
]

export const optionsTaskType = [
  {
    label: '非定时任务',
    value: 'none'
  },
  {
    label: '指定时间',
    value: 'date'
  },
  {
    label: '周期执行',
    value: 'cron'
  }
]

export const optionsCycle = [
  {
    label: '每天',
    value: '1'
  },
  {
    label: '每周',
    value: '2'
  },
  {
    label: '每月',
    value: '3'
  }
]

export const optionsWeek = ['一', '二', '三', '四', '五', '六', '日'].map((name, index) => {
  const values = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  return {
    label: `星期${name}`,
    value: values[index]
  }
})
