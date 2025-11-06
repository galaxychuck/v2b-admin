import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取系统配置
export function fetchConfig() {
  return request({
    url: buildAdminApiUrl('config/fetch'),
    method: 'get'
  })
}

// 获取订阅计划
export function fetchPlans() {
  return request({
    url: buildAdminApiUrl('plan/fetch'),
    method: 'get'
  })
}

// 获取邮件模板
export function getEmailTemplate() {
  return request({
    url: buildAdminApiUrl('config/getEmailTemplate'),
    method: 'get'
  })
}

// 获取主题模板
export function getThemeTemplate() {
  return request({
    url: buildAdminApiUrl('config/getThemeTemplate'),
    method: 'get'
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: 'user/info',
    method: 'get'
  })
}

// 更新系统配置
export function updateConfig(data) {
  return request({
    url: buildAdminApiUrl('config/update'),
    method: 'post',
    data
  })
}
