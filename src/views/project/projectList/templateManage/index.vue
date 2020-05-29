<template>
  <div class="add-interface-container">
    <EnvDetail v-loading="isLoading" :env-data="envData" :project-id="projectId" />
    <span slot="footer" class="dialog-footer">
      <div class="app-btn app-btn-blue" type="primary" @click="handleConfirm">保 存</div>
      <div class="app-btn app-btn-white" @click="handleCancel">返 回</div>
    </span>
  </div>
</template>

<script>
import { getProjectEnvTemplate, addProjectEnvTemplate, updateProjectEnvTemplate } from '@/api/project'
import EnvDetail from './envDetail'

export default {
  components: {
    EnvDetail
  },
  data() {
    return {
      activeTabName: 'tab-template',
      env: {
        servers: [],
        databases: []
      },
      isDefault: false,
      isLoading: false,
      envData: [{
        name: '模板',
        envs: []
      }]
    }
  },
  computed: {
    projectId() {
      return this.$route.params.id
    },
    allEnvs() {
      const allEnvs = []
      this.envData.forEach(env => allEnvs.push(...env.envs))
      return allEnvs
    },
    allExistedEnvs() {
      return this.allEnvs.filter(env => env.id)
    }
  },
  created() {
    getProjectEnvTemplate({
      id: this.projectId
    }).then(res => {
      this.envData = [{
        name: '模板',
        envs: res.data
      }]
    })
  },
  methods: {
    handleCancel() {
      this.$router.go(-1)
    },
    handleConfirm() {
      this.isLoading = true
      this.submitForm().then(_ => {
        this.$message({
          type: 'success',
          message: '保存成功'
        })
        this.$router.go(-1)
      }).catch(e => {
        this.$message({
          type: 'error',
          message: e.message
        })
      }).finally(_ => {
        this.isLoading = false
      })
    },
    submitForm() {
      return Promise.all([
        this.addRow(),
        this.updateRow()
      ])
    },

    addRow() {
      const formData = []
      this.envData.forEach(env => {
        formData.push(...env.envs.filter(server => !server.id).map(server => ({
          ...server,
          project: this.projectId
        })))
      })
      if (formData.length) {
        return addProjectEnvTemplate(formData)
      } else {
        return Promise.resolve()
      }
    },

    updateRow() {
      return Promise.all(this.allExistedEnvs.map(env => {
        return this.saveEnvRow(env)
      }))
    },

    saveEnvRow(row) {
      const { name, desc, variable } = row
      updateProjectEnvTemplate({
        id: row.id
      }, {
        project: this.projectId,
        name,
        desc,
        variable
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-interface-container {
    min-height: 100vh;
    padding: 40px 30px 90px;

    .tab-label-text {
      display: inline-block;
      width: 110px;
      height: 40px;
    }

    .tab-label-input {
      display: inline-block;
      height: 40px;
      >>> .el-input {
        height: 40px;
        .el-input__inner {
          width: 110px;
          padding: 0;
          border: none;
          background: #f7f9fc;
        }
      }
    }
    .dialog-footer {
      position: absolute;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
</style>
