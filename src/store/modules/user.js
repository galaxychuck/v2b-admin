import { login, logout, getInfo, verifyAuth } from '@/api/auth'
import { config } from '@/config'
import { reloadConfig } from '@/utils/configManager'

const state = {
  token: localStorage.getItem(config.AUTH_CONFIG.tokenKey) || '',
  userInfo: JSON.parse(localStorage.getItem(config.AUTH_CONFIG.userInfoKey) || '{}'),
  authData: localStorage.getItem(config.AUTH_CONFIG.authDataKey) || '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    localStorage.setItem(config.AUTH_CONFIG.tokenKey, token)
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
    localStorage.setItem(config.AUTH_CONFIG.userInfoKey, JSON.stringify(userInfo))
  },
  SET_AUTH_DATA: (state, authData) => {
    state.authData = authData
    localStorage.setItem(config.AUTH_CONFIG.authDataKey, authData)
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  CLEAR_USER: (state) => {
    state.token = ''
    state.userInfo = {}
    state.authData = ''
    state.roles = []
    localStorage.removeItem(config.AUTH_CONFIG.tokenKey)
    localStorage.removeItem(config.AUTH_CONFIG.userInfoKey)
    localStorage.removeItem(config.AUTH_CONFIG.authDataKey)
  }
}

const actions = {
  // 登录
  login({ commit }, userInfo) {
    const { email, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ email: email.trim(), password: password })
        .then(async response => {
          const { data } = response
          commit('SET_TOKEN', data.token)
          commit('SET_AUTH_DATA', data.auth_data)
          
          // 登录成功后重新加载配置，获取正确的secure_path
          try {
            await reloadConfig()
            console.log('登录成功后配置重新加载完成')
          } catch (error) {
            console.warn('配置重新加载失败，使用默认配置:', error)
          }
          
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then(response => {
          const { data } = response
          if (!data) {
            reject('验证失败，请重新登录。')
          }
          commit('SET_USER_INFO', data)
          commit('SET_ROLES', data.roles || [])
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 登出
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          commit('CLEAR_USER')
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 验证认证状态
  verifyAuth({ commit, state }) {
    return new Promise((resolve, reject) => {
      verifyAuth()
        .then(() => {
          resolve()
        })
        .catch(error => {
          commit('CLEAR_USER')
          reject(error)
        })
    })
  },

  // 重置token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('CLEAR_USER')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
