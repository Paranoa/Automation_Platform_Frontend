<template>
  <div>
    <Navbar />
    <div class="excution-container">
      <div class="excution-search">
        <AppSearch v-model="filterForm.name" class="excution-search-input" @query="handleFilterConfirmed" />
        <svg-icon icon-class="filter" class="excution-search-filter" />
        <el-select v-model="projectId" size="mini" class="excution-search-project">
          <el-option
            v-for="project of $store.getters.allProjects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </div>
      <div class="button-group">
        <template v-if="activeTab === 'caseSet'">
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            :disabled="!currentNode || currentNode.type !== 1"
            @click="addFolder"
          >新建文件夹
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            :disabled="!currentNode || currentNode.type !== 1"
            @click="addCaseSet"
          >新建执行集
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            :disabled="!currentNode || currentNode.type !== 2"
            @click="chooseInterface"
          >选择接口/流程
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            :disabled="!currentNode || currentNode.id === '_default'"
            @click="editNode"
          >编辑
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
          >复制
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            @click="deleteNode"
          >删除
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
          >粘贴
          </el-button>
        </template>
        <template v-else-if="activeTab === 'interface'">
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            @click="multiRunInterface"
          >批量运行
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
            @click="deleteInterfaceFromExcution"
          >删除接口
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
          >批量日志下载
          </el-button>
          <el-button
            plain
            size="small"
            class="app-el-btn-primary"
          >执行报告
          </el-button>
        </template>
      </div>
      <div class="excution-main">
        <div class="excution-caseset" :class="{ 'active': activeTab === 'caseSet' }" @click="activeTab = 'caseSet'">
          <div class="caseset-header">
            <span class="title">当前项目：</span>
            <span v-if="selectedProject">{{ selectedProject.name }}</span>
          </div>
          <div class="caseset-box">
            <el-tree
              node-key="id"
              default-expand-all
              :data="treeData"
              :default-expanded-keys="[9, 10]"
              :expand-on-click-node="false"
              :props="{
                children: 'subs',
                label: 'name'
              }"
              @node-click="handleNodeClick"
            >
              <span slot-scope="{ node, data }">
                <span
                  v-if="data.type === 2"
                  class="icon"
                >
                  <svg-icon icon-class="file" class="default" />
                  <svg-icon icon-class="file-active" class="active" />
                </span>
                <span
                  v-else
                  class="icon"
                >
                  <svg-icon icon-class="folder" class="default" />
                  <svg-icon icon-class="folder-active" class="active" />
                </span>
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </div>
        </div>
        <div class="excution-list" :class="{ 'active': activeTab === 'interface' }" @click="activeTab = 'interface'">
          <ExcutionInterfaceList
            ref="excutionInterfaceList"
            table-height="calc(100vh - 17.97vw)"
            show-selection
            :append-params="appendParamsExcution"
            @selectionChange="activeTab = 'interface'"
          />
        </div>
      </div>
    </div>
    <AddFolder
      v-if="projectId"
      :visible.sync="addFolderVisible"
      :parent="currentParent"
      :folder="currFolder"
      :is-edit="isEditFolder"
      :project-id="projectId"
      @finished="data => handleFinish('folder', data)"
    />
    <AddCaseSet
      v-if="projectId"
      :visible.sync="addCaseSetVisible"
      :parent="currentParent"
      :case-set="currCaseSet"
      :is-edit="isEditCaseSet"
      :project-id="projectId"
      @finished="data => handleFinish('caseSet', data)"
    />
    <el-dialog
      title="选择单接口"
      :visible="interfaceVisible"
      width="80%"
      :before-close="_ => interfaceVisible = false"
    >
      <InterfaceList
        ref="interfaceList"
        table-height="20vw"
        :show-operation="false"
        table-class="app-list-table"
        :append-params="appendParamsChoose"
        show-selection
        show-search
      />
      <span slot="footer" class="dialog-footer-inner">
        <span
          class="app-btn app-btn-blue"
          @click="handleConfirmChoose"
        >确 定
        </span>
        <span
          class="app-btn app-btn-white"
          @click="interfaceVisible = false"
        >取 消
        </span>
      </span>
    </el-dialog>
    <el-dialog
      title="选择运行环境"
      width="20%"
      append-to-body
      :visible="excutionDialogvisible"
      :before-close="_ => excutionDialogvisible = false"
    >
      <el-form
        ref="excuteForm"
        label-position="left"
        label-width="130px"
        :model="form"
        :rules="{
          server: [{ required: true, trigger: 'change', message: '请选择环境' }],
          excuteion: [{ required: true, trigger: 'blur', message: '请输入执行机' }]
        }"
      >
        <el-form-item label="目标环境选择：" prop="server">
          <el-select v-model="form.server" style="width: 100%">
            <el-option v-for="server of serverList" :key="server.id" :label="server.name" :value="server.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行机：" prop="excuteion">
          <el-input v-model="form.excuteion" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="excutionDialogvisible = false">取 消</el-button>
        <el-button v-loading="isExcutionLoading" type="primary" @click="handleExcutionConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Navbar } from '@/layout/components'
import InterfaceList from '../interface/interfaceList'
import ExcutionInterfaceList from './interfaceList'
import { getExcutionSet, deleteExcutionSet, updateExcutionSet } from '@/api/excution'
import { excuteInterface } from '@/api/interface'
import { getProjectEnv } from '@/api/project'
import AppSearch from '@/components/AppSearch'
import AddFolder from './addFolder'
import AddCaseSet from './addCaseSet'

export default {
  name: 'Execution',
  components: {
    InterfaceList,
    ExcutionInterfaceList,
    Navbar,
    AppSearch,
    AddFolder,
    AddCaseSet
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
      filterForm: {
        name: ''
      },
      filterFormConfirmed: {},
      projectId,
      modules: [],
      activeTab: 'caseSet',
      treeData: [{
        id: '_default',
        label: 'default',
        type: '1'
      }],
      currentNode: null,
      addFolderVisible: false,
      currFolder: null,
      isEditFolder: false,
      addCaseSetVisible: false,
      currCaseSet: null,
      isEditCaseSet: false,
      currentParent: null,
      interfaceVisible: false,
      excutionDialogvisible: false,
      serverList: [],
      form: {
        server: '',
        excuteion: '127.0.0.1'
      },
      isExcutionLoading: false
    }
  },
  computed: {
    appendParamsExcution() {
      const params = {
        ...this.filterFormConfirmed
      }
      if (this.currentNode && this.currentNode.type === 2) {
        params.id = this.currentNode.id
      } else {
        params.id = null
      }
      return params
    },
    appendParamsChoose() {
      return {
        project: this.projectId
      }
    },
    selectedProject() {
      return this.$store.getters.selectedProject
    }
  },
  watch: {
    projectId: {
      handler(value) {
        this.$store.dispatch('user/setSelectedProjectId', value)
        this.getExcutionSet()
      },
      immediate: true
    },
    currentNode: {
      handler(value) {
        this.$nextTick(_ => {
          this.refreshExcutionInterfaceList()
        })
      }
    },
    appendParamsChoose() {
      this.$nextTick(_ => {
        this.refreshChooseInterfaceList()
      })
    }
  },
  activated() {
    if (this.needsRefresh) {
      this.refreshExcutionInterfaceList()
      this.refreshChooseInterfaceList()
      this.refreshSelectedProject()
    }
  },
  deactivated() {
    this.needsRefresh = true
  },
  methods: {
    getExcutionSet() {
      getExcutionSet({
        project: this.projectId
      }).then(res => {
        // 始终带有一个前端的default node
        this.treeData = [{
          id: '_default',
          name: 'default',
          type: 1,
          subs: res.data
        }]
        // 测试集变更后, 清空current node并刷新接口列表
        this.currentNode = null
        this.$nextTick(_ => {
          this.refreshExcutionInterfaceList()
        })
      })
    },
    handleNodeClick(data, node) {
      this.currentNode = data
      this.currentNodeTreeData = node
      this.activeTab = 'caseSet'
    },
    addFolder() {
      this.isEditFolder = false
      this.currentParent = this.currentNode
      this.addFolderVisible = true
    },
    editFolder() {
      this.currFolder = this.currentNode
      this.isEditFolder = true
      this.addFolderVisible = true
    },
    addCaseSet() {
      this.isEditCaseSet = false
      this.currentParent = this.currentNode
      this.addCaseSetVisible = true
    },
    editCaseSet() {
      this.currCaseSet = this.currentNode
      this.isEditCaseSet = true
      this.addCaseSetVisible = true
    },
    editNode() {
      if (this.currentNode.type === 1) {
        this.editFolder()
      } else if (this.currentNode.type === 2) {
        this.editCaseSet()
      }
    },
    deleteNode() {
      this.$confirm('确认删除节点？').then(_ => {
        deleteExcutionSet({
          id: this.currentNode.id
        }).then(_ => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          const nodeData = this.currentNodeTreeData
          const parent = nodeData.parent
          const index = parent.childNodes.findIndex(({ id }) => id === nodeData.id)
          parent.childNodes.splice(index, 1)
        })
      }).catch(_ => {})
    },
    chooseInterface() {
      this.interfaceVisible = true
    },
    handleConfirmChoose() {
      const selection = this.$refs.interfaceList.getSelection()
      if (!selection.length) return
      updateExcutionSet({
        id: this.currentNode.id
      }, {
        interface: selection.map(({ id }) => id)
      }).then(_ => {
        this.$message({
          message: '添加 接口/流程 完成',
          type: 'success'
        })
        this.interfaceVisible = false
        this.$refs.excutionInterfaceList.getExcutionInterface()
      })
    },
    handleFinish(type, data) {
      if (type === 'folder') {
        if (this.isEditFolder) {
          // 目前只更新name
          this.currentNode.name = data.name
        } else {
          this.currentParent.subs.push(data)
        }
      } else if (type === 'caseSet') {
        if (this.isEditCaseSet) {
          // 目前只更新name
          this.currentNode.name = data.name
        } else {
          this.currentParent.subs.push(data)
        }
      }
    },
    deleteInterfaceFromExcution() {
      const selection = this.$refs.excutionInterfaceList.getSelection()
      if (!selection.length) {
        this.$message({
          message: '请选择接口/流程'
        })
        return
      }
      updateExcutionSet({
        id: this.currentNode.id
      }, {
        interface: selection.map(({ id }) => id),
        isdelete: true
      }).then(_ => {
        this.$message({
          message: '删除 接口/流程 完成',
          type: 'success'
        })
        this.$refs.excutionInterfaceList.getExcutionInterface()
      })
    },
    handleFilterConfirmed() {
      this.confirmFilterForm()
      this.$nextTick(_ => this.refreshExcutionInterfaceList())
    },
    confirmFilterForm() {
      this.filterFormConfirmed = {
        ...this.filterForm
      }
    },
    refreshExcutionInterfaceList() {
      this.$refs.excutionInterfaceList.refreshInterfaceList()
    },
    refreshChooseInterfaceList() {
      if (this.$refs.interfaceList) {
        this.$refs.interfaceList.refreshInterfaceList()
      }
    },
    refreshSelectedProject() {
      if (this.$store.getters.selectedProjectId) {
        this.projectId = this.$store.getters.selectedProjectId
      }
    },
    multiRunInterface(interfaceObj) {
      if (this.$refs.excutionInterfaceList.getSelection().length) {
        getProjectEnv({
          project: this.selectedProject.id
        }).then(({ data }) => {
          this.serverList = data
          this.excutionDialogvisible = true
        })
      } else {
        this.$message({
          message: '请选择至少一个接口'
        })
      }
    },
    handleExcutionConfirm() {
      if (this.isExcutionLoading) return
      this.isExcutionLoading = true
      this.$refs.excuteForm.validate().then(
        this.excuteInterface
      ).then(res => {
        this.$message({
          message: '运行成功',
          type: 'success'
        })
      }).catch(err => {
        if (err) {
          this.$message({
            message: err.data ? err.data.tip : err.message,
            type: 'error'
          })
        }
      }).finally(_ => {
        this.isExcutionLoading = false
      })
    },
    excuteInterface() {
      const ids = this.$refs.excutionInterfaceList.getSelection().map(({ id }) => id)
      return excuteInterface({
        interface_id: ids,
        server_id: this.form.server,
        executive_machine: this.form.excuteion,
        isdebug: false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.excution-container{
  display: flex;
  flex-direction: column;
  position: absolute;
  top: $navBarHeight; bottom: 0; left: 0; right: 0;
  min-height: calc(100vh - 70px);

  .excution-search {
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

  .excution-main {
    display: flex;
    flex-grow: 1;
    border: 10px solid #D9D9D7;
    .excution-caseset {
      width: 290px;
      min-width: 290px;
      transition: all .3s;
      display: flex;
      flex-direction: column;
      font-size: 16px;

      &.active {
        box-shadow:0 0 5px #3878A6;
        z-index: 1;
      }

      .caseset-header {
        background: #F2F2F2;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-bottom: 1px solid #DBDBDB;
      }

      .caseset-box {
        flex-grow: 1;
        padding-top: 10px;
        padding-left: 5px;
        overflow: auto;
        background: #fff;
        >>> .el-tree {
          .el-tree-node {
            .icon svg.active {
              display: none;
            }
          }
          .el-tree-node.is-current {
            > .el-tree-node__content {
              .icon svg.default {
                display: none;
              }
              .icon svg.active {
                display: inline;
              }
            }
          }
        }
      }
    }
    .excution-list {
      flex-grow: 1;
      overflow: auto;
      &.active {
        box-shadow:0 0 5px #3878A6;
        z-index: 1;
      }
    }
  }
}
</style>
