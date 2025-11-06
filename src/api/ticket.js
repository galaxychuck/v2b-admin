import request from '@/utils/request'
import { buildAdminApiUrl, buildAdminApiUrlWithParams } from '@/utils/api'

// 获取工单列表
export function getTicketList(params) {
  return request({
    url: buildAdminApiUrlWithParams('ticket/fetch', params),
    method: 'get'
  })
}

// 获取工单详情
export function getTicketDetail(id) {
  return request({
    url: buildAdminApiUrlWithParams('ticket/fetch', { id }),
    method: 'get'
  })
}

// 回复工单
export function replyTicket(data) {
  return request({
    url: buildAdminApiUrl('ticket/reply'),
    method: 'post',
    data
  })
}

// 关闭工单
export function closeTicket(id) {
  return request({
    url: buildAdminApiUrl('ticket/close'),
    method: 'post',
    data: { id }
  })
}

// 上传工单图片
export function uploadTicketImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: buildAdminApiUrl('ticket/image/upload'),
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除工单图片
export function deleteTicketImage(path) {
  return request({
    url: buildAdminApiUrl('ticket/image/delete'),
    method: 'post',
    data: { path }
  })
}

// 获取工单图片
export function getTicketImage(encodedPath) {
  return buildAdminApiUrl(`ticket/image/${encodedPath}`)
}
