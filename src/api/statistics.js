import request from '@/utils/request'
import { buildAdminApiUrl } from '@/utils/api'

// 获取概览数据
export function getOverview() {
  return request({
    url: buildAdminApiUrl('stat/getOverride'),
    method: 'get'
  })
}

// 获取订单统计
export function getOrderStats() {
  return request({
    url: buildAdminApiUrl('stat/getOrder'),
    method: 'get'
  })
}

// 获取服务器流量排行
export function getServerRank() {
  return request({
    url: buildAdminApiUrl('stat/getServerLastRank'),
    method: 'get'
  })
}

// 获取用户统计
export function getUserStats(params) {
  return request({
    url: buildAdminApiUrl('stat/getStatUser'),
    method: 'get',
    params
  })
}
