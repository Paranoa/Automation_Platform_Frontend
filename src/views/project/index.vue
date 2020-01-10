<template>
  <div class="project-container">
    <ProjectList ref="projectList" table-height="calc(100vh - 200px)" show-selection>
      <template slot="tableHead">
        <el-button size="small" plain @click="addProjectVisible = true" @finished="refreshProjectList">新建</el-button>
        <el-button size="small" plain>复制</el-button>
        <el-button size="small" plain @click="deleteProjects">删除</el-button>
        <el-button size="small" plain @click="changeState(false)">停用</el-button>
        <el-button size="small" plain @click="changeState(true)">启用</el-button>
      </template>
    </ProjectList>
    <AddProject :visible.sync="addProjectVisible" />
  </div>
</template>

<script>
import ProjectList from './projectList'
import AddProject from './addProject'
import { updateProjectsStatus, deleteProjects } from '@/api/project'

export default {
  name: 'Project',
  components: {
    ProjectList,
    AddProject
  },
  data() {
    return {
      form: {
        query: ''
      },
      addProjectVisible: false
    }
  },
  mounted() {
    this.projects = this.$refs.projectList
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
        })
      }).catch(_ => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      })
    },
    refreshProjectList() {
      this.projects.getProjectList()
    }
  }
}
</script>

<style lang="scss" scoped>

.project-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  padding: 10px;
}
</style>
