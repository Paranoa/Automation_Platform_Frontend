export default function(scope) {
  return {
    name: [
      { required: true, trigger: 'blur', message: '请输入项目名称' }
    ],
    start_time: [
      {
        validator(rule, value, callback) {
          if (!value) {
            callback(new Error('请选择开始时间'))
          }
          if (scope.form.end_time) {
            scope.$refs.projectForm.validateField('end_time')
          }
          callback()
        },
        trigger: 'change'
      }
    ],
    end_time: [
      {
        validator(rule, value, callback) {
          if (!value) {
            callback(new Error('请选择结束时间'))
          } else if (scope.form.start_time && value.getTime() < scope.form.start_time.getTime()) {
            callback(new Error('结束时间不能早于开始时间'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ],
    level: [
      { required: true, trigger: 'change', message: '请选择项目优先级' }
    ],
    person_charge: [
      { required: true, trigger: 'change', message: '请选择负责人' }
    ]
  }
}
