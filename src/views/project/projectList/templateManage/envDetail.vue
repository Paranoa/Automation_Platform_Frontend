<template>
  <div v-loading="loading" class="env-detail-main">
    <div v-for="env of envData" :key="env.name" class="env-detail-main-content">
      <h3 class="title">{{ env.name }}
        <span
          class="app-link-blue add"
          @click="env.envs.push({
          })"
        >添加</span>
      </h3>
      <el-table
        :data="env.envs"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          label="名称"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="环境描述"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.desc" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="自定义变量"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.variable" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          header-align="center"
          align="center"
          width="100px"
        >
          <template slot-scope="scope">
            <span
              class="app-link-blue"
              @click="scope.row.id ? deleteEnv(scope.row, scope.$index, env.envs) : env.envs.splice(scope.$index, 1)"
            >删除</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { deleteProjectEnvTemplate } from '@/api/project'
export default {
  props: {
    envData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'stripe-row'
      }
    },
    deleteEnv(row, index, data) {
      this.$confirm('确认删除？')
        .then(_ => {
          this.loading = true
          deleteProjectEnvTemplate({ id: row.id }).then(_ => {
            data.splice(index, 1)
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          }).catch(e => {
            this.$message({
              message: e.message,
              type: 'error'
            })
          }).finally(_ => {
            this.loading = false
          })
        })
        .catch(_ => {})
    }
  }
}
</script>

<style scoped lang="scss">
  .env-detail-main {
    .env-detail-main-content {
      margin-top: 20px;
      .title {
        font-size: 14px;
        .add {
          float: right;
          width: 100px;
          text-align: center;
        }
      }

      .el-table {
        border: 1px solid #D9D9D7;
        border-radius: 5px;

        >>> .el-input.is-disabled .el-input__inner {
          color: currentColor;
        }

        >>> .stripe-row {
          background: rgba(239,243,246, .6);
        }
      }
    }
  }
</style>
