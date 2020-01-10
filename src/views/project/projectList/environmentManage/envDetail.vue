<template>
  <div>
    <div>
      <h3>服务器
        <el-button type="primary" style="float: right" @click="serverData.push({})">+</el-button>
      </h3>
      <el-table
        :data="serverData"
        style="width: 100%"
      >
        <el-table-column
          label="服务器名"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="IP OR URL"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.ip_url" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="环境描述"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.desc" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="自定义变量"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.custom_variable" size="mini" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="serverData.splice(scope.$index, 1)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <h3>数据库
        <el-button type="primary" style="float: right" @click="dbData.push({})">+</el-button>
      </h3>
      <el-table
        :data="dbData"
        style="width: 100%"
      >
        <el-table-column
          label="数据库名"
          width="150"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="IP"
          width="150"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.ip" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="端口"
          width="100"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.port" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="用户名"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.username" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="密码"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.pwd" size="mini" />
          </template>
        </el-table-column>
        <el-table-column
          label="自定义变量"
          width="180"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.custom_variable" size="mini" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="dbData.splice(scope.$index, 1)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    serverData: {
      type: Array,
      default() {
        return []
      }
    },
    dbData: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
    }
  },
  methods: {
  }
}
</script>

<style>

</style>
