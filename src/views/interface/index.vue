<template>
  <div>
    <Navbar />
    <div class="interface-container">
      <div class="interface-search">
        <AppSearch v-model="filterForm.name" class="interface-search-input" @query="handleFilterConfirmed" />
        <svg-icon icon-class="filter" class="interface-search-filter" @click="showFilterDialog" />
        <el-select v-model="projectId" size="mini" class="interface-search-project">
          <el-option
            v-for="project of $store.getters.allProjects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </div>
      <div class="button-group">
        <template v-if="activeTab === 'module'">
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            :disabled="!projectId"
            @click="addModule"
          >添加模块
          </el-button>
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            :disabled="!currModule"
            @click="addInterface"
          >新建接口
          </el-button>
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            :disabled="!currModule"
            @click="addBusinessFlow"
          >新建流程
          </el-button>
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            :disabled="!(projectId && currModule)"
            @click="setTopModule(currModule)"
          >置顶模块
          </el-button>
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            :disabled="!currModule"
            @click="editModule"
          >编辑模块
          </el-button>
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            :disabled="!currModule"
            @click="deleteModule"
          >删除模块
          </el-button>
        </template>
        <template v-else-if="activeTab === 'interface'">
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
          >复制</el-button>
          <el-button
            size="small"
            plain
            class="app-el-btn-primary"
            @click="deleteInterface"
          >删除
          </el-button>
        </template>
      </div>
      <div class="interface-block">
        <div class="interface-modules" :class="{ 'active': activeTab === 'module' }" @click="activeTab = 'module'">
          <div class="modules-header">
            <span class="title">当前项目：</span>
            <span v-if="selectedProject">{{ selectedProject.name }}</span>
          </div>
          <div class="modules-box">
            <div
              v-for="item of modulesSorted"
              :key="item.id"
              :class="{ 'active': currModule === item }"
              class="modules-item"
              @click="selectModule(item)"
            >
              <span style="position: relative">
                <i v-if="currModule === item" class="icon-point" />
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="interface-list" :class="{ 'active': activeTab === 'interface' }" @click="activeTab = 'interface'">
          <InterfaceList
            ref="interfaceList"
            show-selection
            table-height="calc(100vh - 18.125vw)"
            :append-params="appendParams"
            @select="activeTab = 'interface'"
          />
        </div>
      </div>
      <AddModule
        v-if="projectId"
        :visible.sync="addModuleVisible"
        :project-id="projectId"
        :module="currModule"
        :is-edit="isEditModule"
        @finished="handleModuleUpdated"
      />
      <FilterDialog
        :visible.sync="filterDialogVisible"
        @selected="handleFilterSelected"
      />
    </div>
  </div>
</template>

<script>
import { Navbar } from '@/layout/components'
import InterfaceList from './interfaceList'
import AddModule from './addModule'
import { getAllModules, updateModule, deleteModule, deleteInterface } from '@/api/interface'
import AppSearch from '@/components/AppSearch'
import FilterDialog from './interfaceList/filterDialog'

export default {
  name: 'Interface',
  components: {
    Navbar,
    InterfaceList,
    AddModule,
    AppSearch,
    FilterDialog
  },
  data() {
    let projectId = ''
    if (this.$store.getters.allProjects) {
      // 如果有已选中的项目则选中 否则选中第一条
      if (this.$store.getters.selectedProjectId) {
        projectId = this.$store.getters.selectedProjectId
      } else if (this.$store.getters.allProjects.length) {
        projectId = this.$store.getters.allProjects[0].id
      }
    }
    return {
      projectId,
      modules: [],
      currModule: null,
      addModuleVisible: false,
      addInterfaceVisible: false,
      filterForm: {
        name: ''
      },
      filterFormConfirmed: {
      },
      filterDialogVisible: false,
      activeTab: 'module',
      isEditModule: false
    }
  },
  computed: {
    appendParams() {
      const params = {
        ...this.filterFormConfirmed
      }
      if (this.projectId) {
        params.project = this.projectId
      }
      if (this.currModule && this.currModule.id) {
        params.intermodule = this.currModule.id
      }
      return params
    },
    modulesSorted() {
      return [...this.modules].sort((a, b) => {
        if (a.top) {
          return -1
        } else if (b.n) {
          return 1
        } else {
          return 0
        }
      })
    },
    selectedProject() {
      return this.$store.getters.selectedProject
    }
  },
  watch: {
    projectId: {
      handler(value) {
        this.$store.dispatch('user/setSelectedProjectId', value)

        this.getModules().then(_ => {
          // if (this.modules && this.modules.length) {
          //   this.currModule = this.modules[0]
          // } else {
          //   this.currModule = null
          // }
        })

        this.$nextTick(() => {
          this.$refs.interfaceList.refreshInterfaceList()
        })
      },
      immediate: true
    },
    currModule: {
      handler(value) {
        this.$nextTick(() => {
          this.$refs.interfaceList.refreshInterfaceList()
        })
      }
    }
  },
  activated() {
    if (this.needsRefresh) {
      this.refreshInterfaceList()
      this.refreshSelectedProject()
    }
  },
  deactivated() {
    this.needsRefresh = true
  },
  methods: {
    selectModule(item) {
      if (this.activeTab !== 'module') {
        this.activeTab = 'module'
        return
      }
      if (this.currModule === item) {
        this.currModule = null
      } else {
        this.currModule = item
      }
    },
    getModules() {
      return getAllModules({
        project: this.projectId
      }).then(res => {
        this.modules = res.data
      })
    },
    addModule() {
      this.isEditModule = false
      this.addModuleVisible = true
    },
    editModule() {
      if (this.currModule) {
        this.isEditModule = true
        this.addModuleVisible = true
      }
    },
    deleteModule() {
      this.$confirm('确认删除模块？').then(_ => {
        deleteModule({
          id: this.currModule.id
        }, {
          project: this.projectId
        }).then(_ => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getModules().then(_ => {
            this.currModule = null
          })
        }).catch(e => {
          this.$message({
            message: '删除失败',
            type: 'error'
          })
        })
      }).catch(_ => {})
    },
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    addInterface() {
      this.$router.push({
        name: 'InterfaceAdd',
        params: {
          projectId: this.projectId,
          moduleId: this.currModule.id
        }
      })
    },
    addBusinessFlow() {
      this.$router.push({
        name: 'BusinessAdd',
        params: {
          projectId: this.projectId,
          moduleId: this.currModule.id
        }
      })
    },
    setTopModule(module) {
      updateModule({
        id: module.id
      }, {
        top: 1,
        project: this.projectId
      }).then(_ => {
        this.$message({
          message: '置顶成功',
          type: 'success'
        })
        this.handleModuleUpdated()
      })
    },
    deleteInterface() {
      const selection = this.$refs.interfaceList.getSelection() || []
      const ids = selection.map(({ id }) => id)
      if (!ids.length) {
        return
      }
      this.$confirm('确认删除接口？').then(_ => {
        deleteInterface({
          ids
        }).then(_ => {
          this.$message({
            message: '删除接口成功',
            type: 'success'
          })
          this.refreshInterfaceList()
        }).catch(e => {
          this.$message({
            message: e.message,
            type: 'error'
          })
        })
      }).catch(_ => {})
    },
    copyInterface() {
      const selection = this.$refs.interfaceList.getSelection()
      console.log(selection)
    },
    refreshInterfaceList() {
      this.$refs.interfaceList.refreshInterfaceList()
    },
    handleModuleUpdated() {
      this.getModules().then(_ => {
        this.currModule = this.modules.find(({ id }) => this.currModule.id === id)
      })
    },
    handleFilterSelected(form) {
      this.filterForm = {
        ...this.filterForm,
        ...form
      }
      this.confirmFilterForm()
      this.$nextTick(_ => this.refreshInterfaceList())
    },
    handleFilterConfirmed() {
      this.confirmFilterForm()
      this.$nextTick(_ => this.refreshInterfaceList())
    },
    confirmFilterForm() {
      this.filterFormConfirmed = {
        ...this.filterForm
      }
    },
    refreshSelectedProject() {
      if (this.$store.getters.selectedProjectId) {
        this.projectId = this.$store.getters.selectedProjectId
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
$colorGray: #DCDFE6;

.interface-container{
  display: flex;
  position: absolute;
  top: $navBarHeight; bottom: 0; left: 0; right: 0;
  flex-direction: column;
  min-height: calc(100vh - 70px);

  .interface-search {
    padding: 10px 20px 19px 20px;
    background: #F2F2F2;
    white-space: nowrap;
    font-size: 0;
    &-input {
      width: 1000px;
    }
    &-filter {
      font-size: 20px;
      margin-left: 30px;
      cursor: pointer;
      stroke:#333;
      transition: all .3s;
      &:hover {
        stroke: #0090DA;
      }
    }
    &-project {
      float: right;
      >>> .el-input__inner {
        height: 50px;
        line-height: 50px;
      }
    }
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
  .interface-block {
    display: flex;
    border: 10px solid #D9D9D7;
    flex-grow: 1;
    .interface-modules {
      width: 290px;
      min-width: 290px;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 250px);
      transition: all .3s;
      font-size: 16px;

      &.active {
        box-shadow:0 0 5px #3878A6;
        z-index: 1;
      }
      .modules-header {
        background: #F2F2F2;
        min-height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid #DBDBDB;
      }
      .el-button {
        margin-left: 0;
        margin-top: 2px;
      }
      .modules-box {
        flex-grow: 1;
        overflow: auto;
        background: #F2F2F2;
        .modules-item {
          padding: 5px;
          line-height: 30px;
          text-align: center;
          margin-top: 2px;
          color: #606266;
          cursor: pointer;
          position: relative;
          border-bottom: 1px solid #DBDBDB;

          &:hover, &.active {
            color: #134F82;
            background-color: rgb(247, 249, 252)
          }

          .icon-point {
            position: absolute;
            left: -15px;
            top: 5px;
            width: 8px;
            height: 8px;
            background: #134F82;
            border-radius: 50%;
          }
        }
      }
    }

    .interface-list {
      flex-grow: 1;
      transition: all .3s;
      z-index: 0;
      overflow: auto;
      &.active {
        box-shadow:0 0 5px #3878A6;
        z-index: 1;
      }
    }
  }
}
</style>

