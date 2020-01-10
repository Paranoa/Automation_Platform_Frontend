import { getProjectList } from '@/api/project'

const state = {
  allProjects: []
}

const mutations = {
  SET_ALL_PROJECTS(state, projects) {
    state.allProjects = projects
  }
}

const actions = {
  getAllProjects({ commit }) {
    return getProjectList({ page: 1}).then(res => {
      commit('SET_ALL_PROJECTS', res.data)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}