const state = {
  sidebar: {
    opened: true,
    hidden: false
  }
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
  },
  HIDE_SIDEBAR: state => {
    state.sidebar.hidden = true
    state.sidebar.opened = false
  },
  SHOW_SIDEBAR: state => {
    state.sidebar.hidden = false
    state.sidebar.opened = true
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  hideSideBar({ commit }) {
    commit('HIDE_SIDEBAR')
  },
  showSideBar({ commit }) {
    commit('SHOW_SIDEBAR')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
