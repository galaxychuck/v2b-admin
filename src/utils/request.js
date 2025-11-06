import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { getApiBaseUrl, getDefaultRequestConfig, handleApiResponse, handleApiError } from '@/utils/api'

// 创建axios实例
const service = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: getDefaultRequestConfig().timeout,
  headers: getDefaultRequestConfig().headers
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const authData = store.state.user.authData
    if (authData) {
      // V2Board使用auth_data作为认证方式
      config.headers['Authorization'] = authData
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    try {
      return handleApiResponse(response)
    } catch (error) {
      ElMessage({
        message: error.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })

      // 处理认证相关错误
      if (error.message.includes('未授权') || error.message.includes('权限不足')) {
        ElMessageBox.confirm(
          '您已被登出，可以取消继续留在该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(error)
    }
  },
  error => {
    const processedError = handleApiError(error)
    ElMessage({
      message: processedError.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(processedError)
  }
)

export default service
