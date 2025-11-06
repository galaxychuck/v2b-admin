/**
 * 配置管理模块
 * 负责在应用启动时获取后端配置，并在整个应用中使用
 */

import { getApiBaseUrl } from './api'

class ConfigManager {
  constructor() {
    this.config = null
    this.securePath = null
    this.isInitialized = false
    this.initPromise = null
  }

  /**
   * 初始化配置管理器
   */
  async init() {
    if (this.isInitialized) {
      return this.config
    }

    if (this.initPromise) {
      return this.initPromise
    }

    // 应用启动时使用默认配置，避免403错误
    this.initPromise = Promise.resolve(this._getDefaultConfig())
    try {
      this.config = await this.initPromise
      this.securePath = this.config?.safe?.secure_path || '后台路径'
      this.isInitialized = true
      console.log('配置管理器初始化完成，使用默认配置，secure_path:', this.securePath)
    } catch (error) {
      console.error('配置管理器初始化失败:', error)
      // 使用默认配置
      this.config = this._getDefaultConfig()
      this.securePath = '后台路径'
      this.isInitialized = true
    } finally {
      this.initPromise = null
    }

    return this.config
  }

  /**
   * 获取配置
   */
  async getConfig() {
    if (!this.isInitialized) {
      await this.init()
    }
    return this.config
  }

  /**
   * 获取secure_path
   */
  getSecurePath() {
    if (!this.isInitialized) {
      console.warn('配置管理器尚未初始化，返回默认secure_path')
      return '后台路径'
    }
    return this.securePath
  }

  /**
   * 检查是否已初始化
   */
  isReady() {
    return this.isInitialized
  }

  /**
   * 从后端获取配置
   */
  async _fetchConfig() {
    try {
      const baseUrl = getApiBaseUrl()
      
      // 策略1: 尝试使用认证信息获取完整配置
      const config = await this._tryFetchWithAuth(baseUrl)
      if (config) {
        return config
      }
      
      // 策略2: 尝试从公开接口获取基本信息
      const publicConfig = await this._tryFetchPublic(baseUrl)
      if (publicConfig) {
        return publicConfig
      }
      
      // 策略3: 使用默认配置
      console.warn('所有配置获取策略都失败，使用默认配置')
      return this._getDefaultConfig()
      
    } catch (error) {
      console.error('获取后端配置失败:', error)
      return this._getDefaultConfig()
    }
  }

  /**
   * 尝试使用认证信息获取配置
   */
  async _tryFetchWithAuth(baseUrl) {
    try {
      const adminToken = localStorage.getItem('admin_token')
      if (!adminToken) {
        return null
      }

      const headers = {
        'Authorization': `Bearer ${adminToken}`
      }
      
      const response = await fetch(`${baseUrl}/后台路径/config/fetch`, {
        headers,
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          console.log('通过认证接口获取配置成功')
          return data.data
        }
      }
      
      return null
    } catch (error) {
      console.warn('认证接口获取配置失败:', error)
      return null
    }
  }

  /**
   * 尝试从公开接口获取配置
   */
  async _tryFetchPublic(baseUrl) {
    try {
      // 尝试从公开的配置接口获取基本信息
      // 这里可以添加其他公开接口的逻辑
      
      // 暂时返回null，表示没有公开接口
      return null
    } catch (error) {
      console.warn('公开接口获取配置失败:', error)
      return null
    }
  }

  /**
   * 获取默认配置
   */
  _getDefaultConfig() {
    return {
      safe: {
        secure_path: '后台路径'
      }
    }
  }

  /**
   * 重置配置管理器（用于测试或重新加载配置）
   */
  reset() {
    this.config = null
    this.securePath = null
    this.isInitialized = false
    this.initPromise = null
  }

  /**
   * 重新加载配置（用于用户登录后）
   */
  async reloadConfig() {
    console.log('重新加载配置...')
    this.reset()
    
    try {
      // 尝试从后端获取真实配置
      const config = await this._fetchConfig()
      this.config = config
      this.securePath = this.config?.safe?.secure_path || '后台路径'
      this.isInitialized = true
      console.log('配置重新加载成功，secure_path:', this.securePath)
      return this.config
    } catch (error) {
      console.error('配置重新加载失败:', error)
      // 如果重新加载失败，使用默认配置
      this.config = this._getDefaultConfig()
      this.securePath = '后台路径'
      this.isInitialized = true
      return this.config
    }
  }
}

// 创建单例实例
const configManager = new ConfigManager()

export default configManager

// 导出便捷函数
export const getSecurePath = () => configManager.getSecurePath()
export const isConfigReady = () => configManager.isReady()
export const initConfig = () => configManager.init()
export const reloadConfig = () => configManager.reloadConfig()
