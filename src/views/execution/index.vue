<template>
  <div class="interface-container">
    <div class="interface-modules">
      <el-select size="mini" v-model="projectId" style="margin-top: 5px">
        <el-option v-for="project of $store.getters.allProjects"
          :key="project.id" :label="project.name" :value="project.id" />
      </el-select>
      <div style="margin-top: 5px">
        <el-button size="mini">文
        </el-button>
        <el-button size="mini">执
        </el-button>
        <el-button size="mini">复
        </el-button>
        <el-button size="mini">删
        </el-button>
        <el-button size="mini">粘
        </el-button>
        <el-button size="mini">定
        </el-button>
      </div>
      <div class="modules-box">
        <div
          v-for="item of modules"
          :key="item.id"
          :class="{ 'active': currModule === item }"
          class="modules-item"
          @click="selectModule(item)"
        >{{ item.name }}</div>
      </div>
    </div>
    <div class="interface-main">
      <InterfaceList ref="interfaceList" table-height="calc(100vh - 200px)" show-selection style="width: 0" :appendParams="appendParams">
        <template slot="tableHead">
          <el-button size="small" plain @click="addInterfaceVisible = true">选择接口/流程</el-button>
          <el-button size="small" plain @click="addBusinessFlowVisible = true">批量运行</el-button>
          <el-button size="small" plain @click="copyInterface">删除</el-button>
          <el-button size="small" plain>批量日志下载</el-button>
          <el-button size="small" plain>执行报告</el-button>
        </template>
      </InterfaceList>
    </div>
  </div>
</template>

<script>
import InterfaceList from './interfaceList'
import { getAllModules, editModule } from '@/api/interface'

export default {
  name: 'Execution',
  components: {
    InterfaceList
  },
  data() {
    return {
      projectId: '',
      modules: [],
      currModule: null
    }
  },
  computed: {
    appendParams() {
      const params = {}
      if (this.projectId) {
        params.project = this.projectId
      }
      if (this.currModule && this.currModule.id) {
        params.intermodule = this.currModule.id
      }
      return params
    }
  },
  watch: {
    projectId: {
      handler() {
        this.getModules().then(_ => this.currModule = null)
      }
    }
  },
  methods: {
    copyInterface() {
      const selection = this.$refs.interfaceList.getSelection()
      console.log(selection)
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.interface-container{
  display: flex;
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  padding: 10px;

  .interface-modules {
    width: 150px;
    padding-right: 6px;
    .el-button {
      margin-left: 0;
      margin-top: 2px;
    }
    .modules-box {
      margin-top: 10px;
      padding-right: 10px;
      .modules-item {
        padding: 5px;
        line-height: 30px;
        text-align: center;
        border: 1px solid #ccc;
        margin-top: 2px;
        color: #606266;
        cursor: pointer;

        &:hover, &.active {
          color: #409EFF;
          border-color: #c6e2ff;
          background-color: #ecf5ff;
        }
      }
    }
  }

  .interface-main {
    flex-grow: 1;
    display: flex;
  }
}
</style>

