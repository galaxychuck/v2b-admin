import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取支付方式列表
export function getPaymentList() {
  return request({
    url: buildAdminApiUrl('payment/fetch'),
    method: 'get'
  })
}

// 获取支付方式选项
export function getPaymentMethods() {
  return request({
    url: buildAdminApiUrl('payment/getPaymentMethods'),
    method: 'get'
  })
}

// 获取支付表单
export function getPaymentForm(data) {
  return request({
    url: buildAdminApiUrl('payment/getPaymentForm'),
    method: 'post',
    data
  })
}

// 保存支付方式
export function savePayment(data) {
  return request({
    url: buildAdminApiUrl('payment/save'),
    method: 'post',
    data
  })
}

// 删除支付方式
export function deletePayment(data) {
  return request({
    url: buildAdminApiUrl('payment/drop'),
    method: 'post',
    data
  })
}

// 显示/隐藏支付方式
export function togglePayment(data) {
  return request({
    url: buildAdminApiUrl('payment/show'),
    method: 'post',
    data
  })
}

// 排序支付方式
export function sortPayments(data) {
  return request({
    url: buildAdminApiUrl('payment/sort'),
    method: 'post',
    data
  })
}
