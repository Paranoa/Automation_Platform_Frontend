import Mock from 'mockjs'

const data = Mock.mock({
  'items|20': [{
    id: '@id',
    title: '@sentence(5, 10)',
    'status|1': ['published', 'draft', 'deleted'],
    author: 'name',
    display_time: '@datetime',
    pageviews: '@integer(300, 5000)',
  }]
})

export default [
  {
    url: '/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: 300,
          items: items
        }
      }
    }
  }
]
