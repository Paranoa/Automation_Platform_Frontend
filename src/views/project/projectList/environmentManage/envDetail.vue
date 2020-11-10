<template>
  <div v-loading="loading" class="env-detail-main">
    <div v-for="env of envData" :key="env.name" class="env-detail-main-content">
      <h3 class="title">服务器</h3>
      <el-table
        :data="env.envs"
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          label="自定义变量"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.variable }}
          </template>
        </el-table-column>
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
          label="值"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.value" size="mini" />
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
      </el-table>
    </div>
  </div>
</template>

<script>
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
  created() {
  },
  methods: {
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'stripe-row'
      }
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
          background: #eee;
        }

        >>> .stripe-row {
          background: rgba(239,243,246, .6);
        }
      }
    }
  }
</style>
