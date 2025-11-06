import { config } from '@/config'

/**
 * 获取API基础URL
 */
export function getApiBaseUrl() {
    let baseUrl = ''
    
    if (config.API_CONFIG.urlMode === 'static') {
        const urls = Array.isArray(config.API_CONFIG.staticBaseUrl) 
            ? config.API_CONFIG.staticBaseUrl 
            : [config.API_CONFIG.staticBaseUrl]
        
        // 返回第一个URL，实际项目中可以添加健康检查逻辑
        baseUrl = urls[0]
    } else if (config.API_CONFIG.urlMode === 'auto') {
        const protocol = config.API_CONFIG.autoConfig.useSameProtocol 
            ? window.location.protocol 
            : 'https:'
        const host = window.location.host
        const apiPath = config.API_CONFIG.autoConfig.appendApiPath 
            ? config.API_CONFIG.autoConfig.apiPath 
            : ''
        
        baseUrl = `${protocol}//${host}${apiPath}`
    } else {
        baseUrl = '/api/v1'
    }
    
    // 确保URL以/api/v1结尾
    if (!baseUrl.endsWith('/api/v1')) {
        baseUrl = baseUrl.endsWith('/') ? baseUrl + 'api/v1' : baseUrl + '/api/v1'
    }
    
    return baseUrl
}

/**
 * 构建完整的API URL
 * @param {string} endpoint - API端点
 * @returns {string} 完整的API URL
 */
export function buildApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl()
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${baseUrl}/${cleanEndpoint}`
}

/**
 * 获取管理后台API路径前缀
 * 根据后端路由配置，管理后台API需要包含secure_path
 * 动态从后端配置接口获取，避免硬编码
 */
import { getSecurePath } from './configManager'

export async function getAdminApiPrefix() {
  // 使用配置管理器获取secure_path
  return getSecurePath()
}

/**
 * 同步获取管理后台API路径前缀（用于非异步场景）
 * 如果配置管理器尚未初始化，返回默认值
 */
export function getAdminApiPrefixSync() {
  return getSecurePath()
}

/**
 * 构建管理后台API URL
 * @param {string} endpoint - API端点
 * @returns {string} 完整的管理后台API URL
 */
export function buildAdminApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl()
    const adminPrefix = getAdminApiPrefixSync()
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${baseUrl}/${adminPrefix}/${cleanEndpoint}`
}

/**
 * 异步构建管理后台API URL
 * @param {string} endpoint - API端点
 * @returns {Promise<string>} 完整的管理后台API URL
 */
export async function buildAdminApiUrlAsync(endpoint) {
    const baseUrl = getApiBaseUrl()
    const adminPrefix = await getAdminApiPrefix()
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    return `${baseUrl}/${adminPrefix}/${cleanEndpoint}`
}

/**
 * 获取认证相关的API URL
 * @param {string} endpoint - 认证API端点
 * @returns {string} 完整的认证API URL
 */
export function buildAuthApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  // 认证API直接使用passport前缀，不需要secure_path
  return `${baseUrl}/passport/${cleanEndpoint}`
}

/**
 * 获取自定义请求头
 */
export function getCustomHeaders() {
    if (!config.CUSTOM_HEADERS.enabled) {
        return {}
    }
    
    return config.CUSTOM_HEADERS.headers || {}
}

/**
 * 获取默认请求配置
 */
export function getDefaultRequestConfig() {
    return {
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
            ...getCustomHeaders()
        }
    }
}

/**
 * 处理API响应
 * @param {Object} response - 响应对象
 * @returns {Object} 处理后的响应数据
 */
export function handleApiResponse(response) {
    if (response.data && response.data.code !== undefined) {
        // V2Board API 标准响应格式
        if (response.data.code === 200) {
            return response.data
        } else {
            throw new Error(response.data.message || '请求失败')
        }
    }
    
    return response.data
}

/**
 * 处理API错误
 * @param {Error} error - 错误对象
 * @returns {Error} 处理后的错误
 */
export function handleApiError(error) {
    if (error.response) {
        // 服务器响应了错误状态码
        const { status, data } = error.response
        
        switch (status) {
            case 401:
                throw new Error('未授权，请重新登录')
            case 403:
                throw new Error('权限不足')
            case 404:
                throw new Error('请求的资源不存在')
            case 500:
                throw new Error('服务器内部错误')
            default:
                throw new Error(data?.message || `请求失败 (${status})`)
        }
    } else if (error.request) {
        // 请求已发出但没有收到响应
        throw new Error('网络连接失败，请检查网络设置')
    } else {
        // 请求配置出错
        throw new Error(error.message || '请求配置错误')
    }
}

/**
 * 格式化请求参数
 * @param {Object} params - 请求参数
 * @returns {Object} 格式化后的参数
 */
export function formatRequestParams(params) {
    if (!params) return {}
    
    const formatted = {}
    
    Object.keys(params).forEach(key => {
        const value = params[key]
        
        // 过滤空值
        if (value !== null && value !== undefined && value !== '') {
            // 处理数组
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    formatted[key] = value
                }
            } else {
                formatted[key] = value
            }
        }
    })
    
    return formatted
}

/**
 * 构建查询字符串
 * @param {Object} params - 查询参数
 * @returns {string} 查询字符串
 */
export function buildQueryString(params) {
    const formatted = formatRequestParams(params)
    const queryString = new URLSearchParams()
    
    Object.keys(formatted).forEach(key => {
        const value = formatted[key]
        
        if (Array.isArray(value)) {
            value.forEach(item => queryString.append(key, item))
        } else {
            queryString.append(key, value)
        }
    })
    
    return queryString.toString()
}

/**
 * 构建完整的API URL（包含查询参数）
 * @param {string} endpoint - API端点
 * @param {Object} params - 查询参数
 * @returns {string} 完整的API URL
 */
export function buildApiUrlWithParams(endpoint, params = {}) {
    const baseUrl = buildApiUrl(endpoint)
    const queryString = buildQueryString(params)
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * 构建管理后台API URL（包含查询参数）
 * @param {string} endpoint - API端点
 * @param {Object} params - 查询参数
 * @returns {string} 完整的管理后台API URL
 */
export function buildAdminApiUrlWithParams(endpoint, params = {}) {
    const baseUrl = buildAdminApiUrl(endpoint)
    const queryString = buildQueryString(params)
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
