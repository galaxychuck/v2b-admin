import { createStore } from 'vuex'
import user from './modules/user'
import app from './modules/app'
import permission from './modules/permission'

export default createStore({
  modules: {
    user,
    app,
    permission
  },
  state: {
    // 全局状态
  },
  mutations: {
    // 全局mutations
  },
  actions: {
    // 全局actions
  },
  getters: {
    // 全局getters
  }
})
