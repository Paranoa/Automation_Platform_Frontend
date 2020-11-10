export default {
  name: [
    { required: true, trigger: 'blur', message: '请填写接口名称' }
  ],
  desc: [
    { required: true, trigger: 'blur', message: '请填写接口描述' }
  ],
  request_protocol: [
    { required: true, trigger: 'change', message: '请选择协议' }
  ],
  template_server: [
    { required: true, trigger: 'change', message: '请选择服务器' }
  ],
  template_port: [
    { required: true, trigger: 'change', message: '请填写端口' }
  ],
  request_way: [
    { required: true, trigger: 'change', message: '请选择请求方式' }
  ],
  path_url: [
    { required: true, trigger: 'blur', message: '请填写路径' }
  ]
}
