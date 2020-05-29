<template>
  <div>
    <Navbar />
    <div class="project-container">
      <ProjectList ref="projectList" table-height="calc(100vh - 21.35vw)" show-selection>
        <template slot="tableHead">
          <div class="button-group">
            <el-button class="app-el-btn-primary" size="small" plain @click="addProject" @finished="refreshProjectList">新建项目</el-button>
            <el-button class="app-el-btn-primary" size="small" plain>复制</el-button>
            <el-button class="app-el-btn-primary" size="small" plain @click="deleteProjects">删除</el-button>
            <el-button class="app-el-btn-primary" size="small" plain @click="changeState(false)">停用</el-button>
            <el-button class="app-el-btn-primary" size="small" plain @click="changeState(true)">启用</el-button>
          </div>
        </template>
      </ProjectList>
    </div>
  </div>
</template>

<script>
import { Navbar } from '@/layout/components'
import ProjectList from './projectList'
import { updateProjectsStatus, deleteProjects } from '@/api/project'

export default {
  name: 'Project',
  components: {
    ProjectList,
    Navbar
  },
  data() {
    return {
      form: {
        query: ''
      }
    }
  },
  mounted() {
    this.projects = this.$refs.projectList
  },
  activated() {
    if (this.needsRefresh) {
      this.refreshProjectList()
    }
  },
  deactivated() {
    this.needsRefresh = true
  },
  methods: {
    changeState(status) {
      const selection = this.projects.getSelection()
      if (!(selection && selection.length)) {
        return
      }
      const ids = selection.map(({ id }) => id)
      updateProjectsStatus({
        ids,
        status
      }).then(_ => {
        this.$message({
          type: 'success',
          message: '更新成功'
        })
        this.refreshProjectList()
      })
    },
    addProject() {
      this.$router.push('/project/add')
    },
    deleteProjects() {
      const selection = this.projects.getSelection()
      if (!(selection && selection.length)) {
        return
      }
      this.$confirm('将删除项目, 是否继续?', '提示').then(_ => {
        const ids = selection.map(({ id }) => id)
        deleteProjects({
          ids
        }).then(_ => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.refreshProjectList()
          this.$store.dispatch('user/getAllProjects')
        }).catch(_ => {
          this.$message({
            message: '删除失败，项目有其他关联',
            type: 'error'
          })
        })
      })
    },
    refreshProjectList() {
      this.projects.getProjectList()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.project-container {
  min-height: calc(100vh - 70px);
  position: absolute;
  top: $navBarHeight; bottom: 0; left: 0; right: 0;
}

.button-group {
  padding: 15px 25px;
  background-image: linear-gradient(90deg, #3878A6 0%, #0471AC 30%, #114478 100%);
  font-size: 0;

  >>> .el-button{
    width: 120px;
    height: 50px;
  }
}
</style>
