import request from '@/utils/request'
import { buildAdminApiUrl, buildAdminApiUrlWithParams } from '@/utils/api'

// 获取订单列表
export function getOrderList(params) {
  return request({
    url: buildAdminApiUrlWithParams('order/fetch', params),
    method: 'get'
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: buildAdminApiUrl('order/detail'),
    method: 'post',
    data: { id }
  })
}

// 更新订单
export function updateOrder(data) {
  return request({
    url: buildAdminApiUrl('order/update'),
    method: 'post',
    data
  })
}

// 分配订单
export function assignOrder(data) {
  return request({
    url: buildAdminApiUrl('order/assign'),
    method: 'post',
    data
  })
}

// 标记订单为已支付
export function markOrderAsPaid(tradeNo) {
  return request({
    url: buildAdminApiUrl('order/paid'),
    method: 'post',
    data: { trade_no: tradeNo }
  })
}

// 取消订单
export function cancelOrder(tradeNo) {
  return request({
    url: buildAdminApiUrl('order/cancel'),
    method: 'post',
    data: { trade_no: tradeNo }
  })
}
