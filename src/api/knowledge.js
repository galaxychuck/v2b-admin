import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取知识库列表
export function getKnowledgeList() {
  return request({
    url: buildAdminApiUrl('knowledge/fetch'),
    method: 'get'
  })
}

// 获取知识库分类
export function getKnowledgeCategories() {
  return request({
    url: buildAdminApiUrl('knowledge/getCategory'),
    method: 'get'
  })
}

// 保存知识库文章
export function saveKnowledge(data) {
  return request({
    url: buildAdminApiUrl('knowledge/save'),
    method: 'post',
    data
  })
}

// 显示/隐藏知识库文章
export function toggleKnowledge(data) {
  return request({
    url: buildAdminApiUrl('knowledge/show'),
    method: 'post',
    data
  })
}

// 删除知识库文章
export function deleteKnowledge(data) {
  return request({
    url: buildAdminApiUrl('knowledge/drop'),
    method: 'post',
    data
  })
}

// 排序知识库文章
export function sortKnowledge(data) {
  return request({
    url: buildAdminApiUrl('knowledge/sort'),
    method: 'post',
    data
  })
}
