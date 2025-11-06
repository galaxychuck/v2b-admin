import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取系统配置
export function getConfig() {
  return request({
    url: buildAdminApiUrl('config/fetch'),
    method: 'get'
  })
}

// 保存系统配置
export function saveConfig(data) {
  return request({
    url: buildAdminApiUrl('config/save'),
    method: 'post',
    data
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

// 设置Telegram Webhook
export function setTelegramWebhook(data) {
  return request({
    url: buildAdminApiUrl('config/setTelegramWebhook'),
    method: 'post',
    data
  })
}

// 测试发送邮件
export function testSendMail(data) {
  return request({
    url: buildAdminApiUrl('config/testSendMail'),
    method: 'post',
    data
  })
}

// 获取系统状态
export function getSystemStatus() {
  return request({
    url: buildAdminApiUrl('system/getSystemStatus'),
    method: 'get'
  })
}

// 获取队列统计
export function getQueueStats() {
  return request({
    url: buildAdminApiUrl('system/getQueueStats'),
    method: 'get'
  })
}

// 获取队列工作负载
export function getQueueWorkload() {
  return request({
    url: buildAdminApiUrl('system/getQueueWorkload'),
    method: 'get'
  })
}

// 获取队列主控
export function getQueueMasters() {
  return request({
    url: buildAdminApiUrl('system/getQueueMasters'),
    method: 'get'
  })
}

// 获取主题列表
export function getThemes() {
  return request({
    url: buildAdminApiUrl('theme/getThemes'),
    method: 'get'
  })
}

// 保存主题配置
export function saveThemeConfig(data) {
  return request({
    url: buildAdminApiUrl('theme/saveThemeConfig'),
    method: 'post',
    data
  })
}

// 获取主题配置
export function getThemeConfig(data) {
  return request({
    url: buildAdminApiUrl('theme/getThemeConfig'),
    method: 'post',
    data
  })
}
