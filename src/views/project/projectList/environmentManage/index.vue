<template>
  <div>
    <el-dialog
      class="add-interface-container"
      title="环境管理"
      :visible="visible"
      width="80%"
      :before-close="handleCancel"
    >
      <el-tabs v-model="activeTabName" type="border-card">
        <el-tab-pane label="测试环境" name="1">
          <EnvDetail :serverData="this.testEnv.pro_servers" :dbData="this.testEnv.pro_databases" />
        </el-tab-pane>
        <el-tab-pane label="开发环境" name="2">
          <EnvDetail :serverData="this.devEnv.pro_servers" :dbData="this.devEnv.pro_databases" />
        </el-tab-pane>
        <el-tab-pane label="预生产" name="3">
          <EnvDetail :serverData="this.ppdtEnv.pro_servers" :dbData="this.ppdtEnv.pro_databases" />
        </el-tab-pane>
        <el-tab-pane label="生产环境" name="4">
          <EnvDetail :serverData="this.pdtEnv.pro_servers" :dbData="this.pdtEnv.pro_databases" />
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addProjectEnv } from '@/api/project'
import EnvDetail from './envDetail'

export default {
  components: {
    EnvDetail
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeTabName: '1',
      testEnv: {},
      devEnv: {},
      ppdtEnv: {},
      pdtEnv: {}
    }
  },
  watch: {
    project: {
      handler() {
        const envs = this.project.envs
        envs.forEach(env => {
          if (env.env === 1) {
            this.testEnv = env
          } else if (env.env === 2) {
            this.devEnv = env
          } else if (env.env === 3) {
            this.ppdtEnv = env
          } else if (env.env === 4) {
            this.pdtEnv = env
          }
        })
      },
      immediate: true
    }
  },
  methods: {
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      Promise.all([
        this.addEnv(this.testEnv),
        this.addEnv(this.devEnv),
        this.addEnv(this.ppdtEnv),
        this.addEnv(this.pdtEnv)
      ]).then(_ => {
        this.$message({
          type: 'success',
          message: '更新成功'
        })
        this.$emit('update:visible', false)
      })
    },
    addEnv(env) {
      return addProjectEnv({
        env: env.env,
        envid: env.id
      }, {
        project: this.project.id,
        pro_servers: env.pro_servers.map(server => ({ ...server, pro_env: env.id})),
        pro_databases: env.pro_databases.map(db => ({ ...db, pro_env: env.id}))
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
