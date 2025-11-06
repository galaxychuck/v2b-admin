import request from '@/utils/request'
import { buildAuthApiUrl, buildAdminApiUrl } from '@/utils/api'

// 管理员登录
export function login(data) {
  return request({
    url: buildAuthApiUrl('auth/login'),
    method: 'post',
    data
  })
}

// 获取管理员信息
export function getInfo() {
  return request({
    url: buildAdminApiUrl('user/getUserInfoById'),
    method: 'get',
    params: { id: 'current' } // 获取当前登录用户信息
  })
}

// 管理员登出
export function logout() {
  return request({
    url: buildAuthApiUrl('auth/logout'),
    method: 'post'
  })
}

// 刷新认证数据
export function refreshAuth() {
  return request({
    url: buildAuthApiUrl('auth/refresh'),
    method: 'post'
  })
}

// 验证认证状态
export function verifyAuth() {
  return request({
    url: buildAdminApiUrl('config/fetch'),
    method: 'get'
  })
}
