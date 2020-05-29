import { login, logout, getAllUsers, getUserInfo } from '@/api/user'
import { getProjectList } from '@/api/project'
import { getToken, getRefreshToken, setToken, setRefreshToken, removeToken, removeRefreshToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  refreshToken: getRefreshToken(),
  name: '',
  userInfo: '',
  avatar: '',
  allUsers: [],
  allProjects: [],
  selectedProjectId: +localStorage.selectedProjectId || null
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_REFRESH_TOKEN: (state, token) => {
    state.refreshToken = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_USER_INFO: (state, data) => {
    state.userInfo = data
  },
  SET_ALL_USERS: (state, users) => {
    state.allUsers = users
  },
  SET_ALL_PROJECTS(state, projects) {
    state.allProjects = projects
  },
  SET_SELECTED_PROJECT(state, projectId) {
    state.selectedProjectId = projectId
    localStorage.selectedProjectId = projectId
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        commit('SET_REFRESH_TOKEN', data.refresh_token)
        setToken(data.token)
        setRefreshToken(data.refresh_token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ dispatch }) {
    return Promise.all([
      dispatch('getUserInfo'),
      dispatch('getAllUsers'),
      dispatch('getAllProjects')
    ])
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        removeToken()
        removeRefreshToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      removeRefreshToken()
      resolve()
    })
  },

  // 获取用户信息
  getUserInfo({ commit }) {
    return getUserInfo().then(res => {
      commit('SET_USER_INFO', res.data)
    }).catch(e => console.error(e))
  },

  // 获取全部用户
  getAllUsers({ commit }) {
    return getAllUsers().then(res => {
      commit('SET_ALL_USERS', res.data)
    })
  },

  // 获取全部项目
  getAllProjects({ commit }) {
    return getProjectList({ page: 1, page_size: 100 }).then(res => {
      commit('SET_ALL_PROJECTS', res.data.results)
    })
  },

  setSelectedProjectId({ commit }, projectId) {
    commit('SET_SELECTED_PROJECT', projectId)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

