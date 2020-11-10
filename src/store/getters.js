const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  userInfo: state => state.user.userInfo,
  allUsers: state => state.user.allUsers,
  allProjects: state => state.user.allProjects,
  selectedProjectId: state => state.user.selectedProjectId,
  selectedProject: state => state.user.allProjects.find(p => p.id === state.user.selectedProjectId),
  lastInterfacePageState: state => state.app.lastInterfacePageState,
  executors: state => state.user.executors
}
export default getters
