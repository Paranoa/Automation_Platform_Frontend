<template>
  <div class="add-interface-container">
    <el-tabs
      v-model="activeTabName"
      v-loading="isTabLoading"
      type="card"
      closable
      @tab-remove="handleTabsRemove"
    >
      <el-tab-pane v-for="(env, index) of envList" :key="env.id" :label="env.name" :name="`tab-${env.id}`">
        <span slot="label" v-loading="env.isNameLoading" class="tab-label-container">
          <span
            v-show="!env.isEditingName"
            class="tab-label-text"
            @click="editEnvName(env)"
          >{{ env.name }}
          </span>
          <span
            v-show="env.isEditingName"
            class="tab-label-input"
          >
            <el-input
              :ref="`input-env-name-${env.id}`"
              v-model="env.name"
              @blur="saveEnvName(env)"
            />
          </span>
          <span
            v-if="index === envList.length - 1"
            class="tab-label-add"
            @click="handleTabsAdd"
          >
            <i class="el-icon-plus" />
          </span>
        </span>
        <EnvDetail :env-data="env.envData" :project-id="projectId" />
      </el-tab-pane>
    </el-tabs>
    <span slot="footer" class="dialog-footer">
      <el-button v-loading="isTabLoading" class="app-btn app-btn-blue" type="primary" @click="handleConfirm">保 存</el-button>
      <el-button class="app-btn app-btn-white" @click="handleCancel">返 回</el-button>
    </span>
  </div>
</template>

<script>
import { getProjectEnv, addProjectEnv, updateProjectEnv, getProjectEnvTemplate, deleteProjectEnv } from '@/api/project'
import EnvDetail from './envDetail'

export default {
  components: {
    EnvDetail
  },
  data() {
    return {
      activeTabName: '',
      envList: [],
      isTabLoading: false,
      envTemplate: []
    }
  },
  computed: {
    projectId() {
      return this.$route.params.id
    },
    activeEnv() {
      const id = this.activeTabName.substring(4)
      return this.envList.find(env => env.id.toString() === id)
    },
    isEditingEnvName() {
      return this.envList.some(e => e.isEditingName)
    }
  },
  created() {
    Promise.all([
      this.getProjectEnv(),
      this.getProjectEnvTemplate()
    ]).then(([envList, template]) => {
      this.envList = envList
      this.envTemplate = template
      if (this.envList.length) {
        this.envList.forEach(env => this.initEnvTab(env))
        const firstEnv = this.envList[0]
        this.activeTabName = `tab-${firstEnv.id}`
      } else {
        this.addDefaultEnv()
      }
    })
  },
  methods: {
    addDefaultEnv() {
      const env = {
        id: '_default',
        name: '默认环境'
      }
      this.envList.push(env)
      this.activeTabName = 'tab-_default'
    },
    handleTabsAdd(targetName) {
      const addNewTab = () => {
        const env = {
          id: '_default_new',
          name: '新增环境',
          lastModified: '新增环境',
          isEditingName: true
        }
        this.envList.push(env)
        this.initEnvTab(env)
        this.activeTabName = `tab-${env.id}`
        setTimeout(_ => {
          this.$refs[`input-env-name-${env.id}`][0].focus()
        })
      }

      // 如果在新增环境时 第一个默认环境仍未保存 则先保存第一个环境
      const firstEnv = this.envList[0]
      if (firstEnv.id === '_default') {
        this.saveEnvName(firstEnv).then(_ => {
          addNewTab()
        })
      } else {
        addNewTab()
      }
    },
    handleTabsRemove(targetName) {
      // el-tab带有backspace(keyCode:8) delete(keyCode:46)键触发删除tab的功能 以isEditingEnvName做标识 当编辑tab名时按键不做删除操作
      if (this.isEditingEnvName) return
      const id = targetName.substring(4)
      // 前端的默认环境不可删除
      if (id === '_default') return
      const env = this.envList.find(env => env.id.toString() === id)
      const index = this.envList.indexOf(env)

      this.$confirm('确认删除环境？').then(_ => {
        deleteProjectEnv({
          id
        }).then(_ => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          if (this.activeTabName === targetName) {
            // 如果是删除最后一个环境 添加一个前端的默认环境
            if (this.envList.length === 1) {
              this.addDefaultEnv()
            } else {
              // 选择删除项的前面一项作为当前页 如果是第一项 选择后面一项作为当前页
              if (index === 0) {
                this.activeTabName = `tab-${this.envList[index + 1].id}`
              } else {
                this.activeTabName = `tab-${this.envList[index - 1].id}`
              }
            }
          }
          this.envList.splice(index, 1)
        }).catch(e => {
          this.$message({
            type: 'error',
            message: e.message
          })
        })
      }).catch(_ => {})
    },
    editEnvName(env) {
      if (this.activeTabName === `tab-${env.id}`) {
        this.$set(env, 'isEditingName', true)
        env.lastModified = env.name
        setTimeout(_ => {
          this.$refs[`input-env-name-${env.id}`][0].focus()
        })
      }
    },
    saveEnvName(env) {
      if (env.id === '_default' || env.id === '_default_new') {
        this.$set(env, 'isNameLoading', true)
        return addProjectEnv({
          project: this.projectId,
          name: env.name
        }).then(res => {
          env.id = res.data.id
          // id变更 更新activeTab
          this.activeTabName = `tab-${env.id}`
        }).catch(e => {
          this.$message({
            message: e.message,
            type: 'error'
          })
        }).finally(_ => {
          this.$set(env, 'isNameLoading', false)
          this.$set(env, 'isEditingName', false)
        })
      } else {
        if (env.name !== env.lastModified) {
          this.$set(env, 'isNameLoading', true)
          return updateProjectEnv({
            id: env.id
          }, {
            project: this.projectId,
            name: env.name
          }).then(_ => {
          }).catch(e => {
            this.$message({
              message: e.message,
              type: 'error'
            })
          }).finally(_ => {
            this.$set(env, 'isNameLoading', false)
            this.$set(env, 'isEditingName', false)
          })
        } else {
          this.$set(env, 'isEditingName', false)
        }
      }
    },
    getProjectEnv() {
      return getProjectEnv({
        project: this.projectId
      }).then(res => res.data)
    },
    getProjectEnvTemplate() {
      return getProjectEnvTemplate({
        id: this.projectId
      }).then(res => {
        // TODO 模板按类型分类
        return [{
          name: '类型',
          envs: res.data.map(({ variable }) => ({
            name: '',
            value: '',
            desc: '',
            variable
          }))
        }]
      })
    },
    initEnvTab(env) {
      if (env.id === '_default' || env.id === '_default_new') {
        this.$set(env, 'envData', this.getEnvData(this.envTemplate))
        env.inited = true
      } else {
        env.inited = true
        this.$set(env, 'envData', this.getEnvData(this.envTemplate, env.envcontent))
      }
    },
    getEnvData(template, data) {
      const defaultDatas = {}
      if (data) {
        data.forEach(d => {
          defaultDatas[d.variable] = d
        })
      }

      return template.map(t => ({
        ...t,
        envs: t.envs.map(e => {
          if (defaultDatas[e.variable]) {
            return {
              ...defaultDatas[e.variable]
            }
          } else {
            return {
              ...e
            }
          }
        })
      }))
    },
    handleCancel() {
      this.$router.go(-1)
    },
    handleConfirm() {
      if (this.isTabLoading) return
      this.isTabLoading = true
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
        this.isTabLoading = false
      })
    },
    submitForm() {
      return Promise.all(this.envList.map(env => this.getEnvRequest(env)))
    },
    getEnvRequest(env) {
      const getEnvData = (envData) => {
        return envData[0].envs
      }
      if (env.id === '_default') {
        return addProjectEnv({
          name: env.name,
          project: this.projectId,
          envcontent: getEnvData(env.envData)
        })
      } else {
        return updateProjectEnv({
          id: env.id
        }, {
          project: this.projectId,
          envcontent: getEnvData(env.envData)
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-interface-container {
    min-height: 100vh;
    padding: 40px 30px 90px;

    >>> .el-tabs {
      &.el-tabs--card >.el-tabs__header .el-tabs__item.is-active {
        border-bottom-color: #f7f9fc;
      }
    }

    .tab-label-container {
      position: relative;

      .tab-label-text {
        display: inline-block;
        width: 110px;
        height: 40px;
      }

      .tab-label-input {
        display: inline-block;
        >>> .el-input {
          height: 40px;
          margin-top: 1px;
          .el-input__inner {
            width: 110px;
            height: 20px;
            padding: 0;
            border: none;
            background: #f7f9fc;
          }
        }
      }

      .tab-label-add {
        position: absolute;
        right: -40px;
        width: 20px;
        padding-left: 10px;
        text-align: center;
        transform: translateX(100%);
        box-sizing: content-box;
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
