import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取公告列表
export function getNoticeList() {
  return request({
    url: buildAdminApiUrl('notice/fetch'),
    method: 'get'
  })
}

// 保存公告
export function saveNotice(data) {
  return request({
    url: buildAdminApiUrl('notice/save'),
    method: 'post',
    data
  })
}

// 更新公告
export function updateNotice(data) {
  return request({
    url: buildAdminApiUrl('notice/update'),
    method: 'post',
    data
  })
}

// 删除公告
export function deleteNotice(data) {
  return request({
    url: buildAdminApiUrl('notice/drop'),
    method: 'post',
    data
  })
}

// 显示/隐藏公告
export function toggleNotice(data) {
  return request({
    url: buildAdminApiUrl('notice/show'),
    method: 'post',
    data
  })
}
