import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取套餐列表
export function getPlanList() {
  return request({
    url: buildAdminApiUrl('plan/fetch'),
    method: 'get'
  })
}

// 保存套餐
export function savePlan(data) {
  return request({
    url: buildAdminApiUrl('plan/save'),
    method: 'post',
    data
  })
}

// 删除套餐
export function deletePlan(data) {
  return request({
    url: buildAdminApiUrl('plan/drop'),
    method: 'post',
    data
  })
}

// 更新套餐
export function updatePlan(data) {
  return request({
    url: buildAdminApiUrl('plan/update'),
    method: 'post',
    data
  })
}

// 排序套餐
export function sortPlans(data) {
  return request({
    url: buildAdminApiUrl('plan/sort'),
    method: 'post',
    data
  })
}
