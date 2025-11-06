import request from '@/utils/request'
import { buildAdminApiUrl, buildAdminApiUrlWithParams } from '@/utils/api'

// 获取服务器组列表
export function getServerGroups() {
  return request({
    url: buildAdminApiUrl('server/group/fetch'),
    method: 'get'
  })
}

// 保存服务器组
export function saveServerGroup(data) {
  return request({
    url: buildAdminApiUrl('server/group/save'),
    method: 'post',
    data
  })
}

// 删除服务器组
export function deleteServerGroup(data) {
  return request({
    url: buildAdminApiUrl('server/group/drop'),
    method: 'post',
    data
  })
}

// 获取路由列表
export function getServerRoutes() {
  return request({
    url: buildAdminApiUrl('server/route/fetch'),
    method: 'get'
  })
}

// 保存路由
export function saveServerRoute(data) {
  return request({
    url: buildAdminApiUrl('server/route/save'),
    method: 'post',
    data
  })
}

// 删除路由
export function deleteServerRoute(data) {
  return request({
    url: buildAdminApiUrl('server/route/drop'),
    method: 'post',
    data
  })
}

// 获取节点列表
export function getNodes() {
  return request({
    url: buildAdminApiUrl('server/manage/getNodes'),
    method: 'get'
  })
}

// 排序节点
export function sortNodes(data) {
  return request({
    url: buildAdminApiUrl('server/manage/sort'),
    method: 'post',
    data
  })
}

// Vmess服务器相关API
export function getVmessServers() {
  return request({
    url: buildAdminApiUrl('server/vmess/fetch'),
    method: 'get'
  })
}

export function saveVmessServer(data) {
  return request({
    url: buildAdminApiUrl('server/vmess/save'),
    method: 'post',
    data
  })
}

export function updateVmessServer(data) {
  return request({
    url: buildAdminApiUrl('server/vmess/update'),
    method: 'post',
    data
  })
}

export function deleteVmessServer(data) {
  return request({
    url: buildAdminApiUrl('server/vmess/drop'),
    method: 'post',
    data
  })
}

export function copyVmessServer(data) {
  return request({
    url: buildAdminApiUrl('server/vmess/copy'),
    method: 'post',
    data
  })
}

export function sortVmessServers(data) {
  return request({
    url: buildAdminApiUrl('server/vmess/sort'),
    method: 'post',
    data
  })
}

export function viewVmessConfig(data) {
  return request({
    url: buildAdminApiUrl('server/vmess/viewConfig'),
    method: 'post',
    data
  })
}

// Trojan服务器相关API
export function getTrojanServers() {
  return request({
    url: buildAdminApiUrl('server/trojan/fetch'),
    method: 'get'
  })
}

export function saveTrojanServer(data) {
  return request({
    url: buildAdminApiUrl('server/trojan/save'),
    method: 'post',
    data
  })
}

export function updateTrojanServer(data) {
  return request({
    url: buildAdminApiUrl('server/trojan/update'),
    method: 'post',
    data
  })
}

export function deleteTrojanServer(data) {
  return request({
    url: buildAdminApiUrl('server/trojan/drop'),
    method: 'post',
    data
  })
}

export function copyTrojanServer(data) {
  return request({
    url: buildAdminApiUrl('server/trojan/copy'),
    method: 'post',
    data
  })
}

export function sortTrojanServers(data) {
  return request({
    url: buildAdminApiUrl('server/trojan/sort'),
    method: 'post',
    data
  })
}

export function viewTrojanConfig(data) {
  return request({
    url: buildAdminApiUrl('server/trojan/viewConfig'),
    method: 'post',
    data
  })
}

// Shadowsocks服务器相关API
export function getShadowsocksServers() {
  return request({
    url: buildAdminApiUrl('server/shadowsocks/fetch'),
    method: 'get'
  })
}

export function saveShadowsocksServer(data) {
  return request({
    url: buildAdminApiUrl('server/shadowsocks/save'),
    method: 'post',
    data
  })
}

export function updateShadowsocksServer(data) {
  return request({
    url: buildAdminApiUrl('server/shadowsocks/update'),
    method: 'post',
    data
  })
}

export function deleteShadowsocksServer(data) {
  return request({
    url: buildAdminApiUrl('server/shadowsocks/drop'),
    method: 'post',
    data
  })
}

export function copyShadowsocksServer(data) {
  return request({
    url: buildAdminApiUrl('server/shadowsocks/copy'),
    method: 'post',
    data
  })
}

export function sortShadowsocksServers(data) {
  return request({
    url: buildAdminApiUrl('server/shadowsocks/sort'),
    method: 'post',
    data
  })
}
