const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  allUsers: state => state.user.allUsers,
  allProjects: state => state.project.allProjects
}
export default getters
