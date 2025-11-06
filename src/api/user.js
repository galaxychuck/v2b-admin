import request from '@/utils/request'
import { buildAdminApiUrl, buildAdminApiUrlWithParams } from '@/utils/api'

// 获取用户列表
export function getUserList(params) {
  return request({
    url: buildAdminApiUrlWithParams('user/fetch', params),
    method: 'get'
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: buildAdminApiUrl('user/getUserInfoById'),
    method: 'get',
    params: { id }
  })
}

// 更新用户信息
export function updateUser(data) {
  return request({
    url: buildAdminApiUrl('user/update'),
    method: 'post',
    data
  })
}

// 生成用户
export function generateUser(data) {
  return request({
    url: buildAdminApiUrl('user/generate'),
    method: 'post',
    data
  })
}

// 导出用户CSV
export function exportUserCSV(params) {
  return request({
    url: buildAdminApiUrl('user/dumpCSV'),
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

// 发送邮件给用户
export function sendMailToUser(data) {
  return request({
    url: buildAdminApiUrl('user/sendMail'),
    method: 'post',
    data
  })
}

// 禁用/启用用户
export function banUser(data) {
  return request({
    url: buildAdminApiUrl('user/ban'),
    method: 'post',
    data
  })
}

// 重置用户密钥
export function resetUserSecret(data) {
  return request({
    url: buildAdminApiUrl('user/resetSecret'),
    method: 'post',
    data
  })
}

// 设置邀请用户
export function setInviteUser(data) {
  return request({
    url: buildAdminApiUrl('user/setInviteUser'),
    method: 'post',
    data
  })
}
