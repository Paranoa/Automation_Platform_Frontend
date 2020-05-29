import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken, getRefreshToken, setToken } from '@/utils/auth'
import { refreshToken } from '@/api/user'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // 特殊处理refreshToken
    if (config.url === '/user/authorization/' && config.method === 'put') {
      config.headers['AUTHORIZATION'] = getRefreshToken()
    } else {
      if (store.getters.token) {
        config.headers['AUTHORIZATION'] = getToken()
      }
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */
  response => {
    const res = response.data
    if (!/^20\d$/.test(res.code)) {
      if (res.code === 403) {
        return refreshToken().then(res => {
          if (res && res.code === 201) {
            const { url, method, params, data } = response.config
            setToken(res.data.token)
            return service({
              url,
              method,
              params,
              data
            }
            )
          } else {
            return Promise.reject(new Error('登录超时'))
          }
        })
      } else if (res.code === 401) {
        MessageBox.confirm('登录已超时, 点取消留在当前页面, 点确定重新登录', '登录超时', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        }).catch(err => {
          console.error(err)
        })
      } else {
        return Promise.reject(res)
      }
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    let message = ''
    if (error.response && error.response.data) {
      message = error.response.data.message
    } else {
      message = error.message
    }
    Message({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
