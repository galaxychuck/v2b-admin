import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取优惠券列表
export function getCouponList() {
  return request({
    url: buildAdminApiUrl('coupon/fetch'),
    method: 'get'
  })
}

// 生成优惠券
export function generateCoupon(data) {
  return request({
    url: buildAdminApiUrl('coupon/generate'),
    method: 'post',
    data
  })
}

// 删除优惠券
export function deleteCoupon(data) {
  return request({
    url: buildAdminApiUrl('coupon/drop'),
    method: 'post',
    data
  })
}

// 显示/隐藏优惠券
export function toggleCoupon(data) {
  return request({
    url: buildAdminApiUrl('coupon/show'),
    method: 'post',
    data
  })
}
