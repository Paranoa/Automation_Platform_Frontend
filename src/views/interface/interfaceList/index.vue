<template>
  <div class="interface-list-container">
    <div v-if="showSearch" class="interface-search">
      <AppSearch v-model="filterForm.name" class="interface-search-input" @query="refreshInterfaceList" />
      <svg-icon icon-class="filter" class="interface-search-filter" @click="showFilterDialog" />
    </div>
    <div class="interface-main">
      <el-table
        ref="interfaceList"
        v-loading="listLoading"
        fit
        highlight-current-row
        element-loading-text="Loading"
        :data="list"
        :height="tableHeight"
        :class="tableClassCombined"
        @selection-change="handleSelectionChange"
        v-on="$listeners"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
        />
        <el-table-column align="center" label="编号" width="95">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="名称">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">
            {{ scope.row.interface_type | interfaceType }}
          </template>
        </el-table-column>
        <el-table-column label="描述" width="200" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.desc }}</span>
          </template>
        </el-table-column>
        <el-table-column label="步骤" align="center">
          <template slot-scope="scope">
            {{ scope.row.step_count || '-' }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="创建时间" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.created | parseToDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改人" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.modifier }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="showOperation" label="操作" width="330" align="center">
          <div slot-scope="scope" class="operation-button-group">
            <span @click="editInterface(scope.row)">编辑</span>
            <span @click="bindData(scope.row)">绑定数据</span>
            <template v-if="scope.row.status === 1">
              <span @click="runInterface(scope.row)">运行</span>
            </template>
            <template v-else-if="scope.row.status === 2">
              <span @click="terminateInterface(scope.row)">停止</span>
              <span @click="checkResult(scope.row)">查看结果</span>
            </template>
            <template v-else-if="scope.row.status === 3">
              <span @click="runInterface(scope.row)">运行</span>
              <span @click="checkResult(scope.row)">查看结果</span>
            </template>
          </div>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getInterfaceList" />
    </div>

    <FilterDialog
      :visible.sync="filterDialogVisible"
      :default-data="filterForm"
      :static-data="appendParams"
      @selected="handleFilterSelected"
    />

    <el-dialog
      v-if="showOperation"
      title="上传数据源"
      :visible="addDataVisible"
      width="40%"
      append-to-body
      :before-close="handleCancelUpload"
    >
      <el-form>
        <el-form-item label="数据源文件名" label-width="100px">
          <el-input v-model="addForm.fileName" />
        </el-form-item>
      </el-form>
      <FileUpload
        v-if="bindDataInterface"
        ref="uploadDatasource"
        v-model="addForm.datasourceFile"
        name="file_name"
        :action="`${baseUrl}/datasource/sources/`"
        :data="{ title: addForm.fileName, project: bindDataInterface.project }"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      />
      <span slot="footer" class="dialog-footer">
        <el-button class="app-btn-green" @click="handleChooseExisted">选择已有数据源</el-button>
        <el-button @click="handleCancelUpload">取 消</el-button>
        <el-button type="primary" @click="handleConfirmUpload">确 定</el-button>
      </span>
    </el-dialog>

    <ExecutionResult
      v-if="currInterface && caseResultList"
      :visible.sync="executionResultVisible"
      :interface-obj="currInterface"
      :case-result-list="caseResultList"
    />

    <el-dialog
      v-if="showOperation"
      title="选择已有数据源"
      :visible="datasourceListVisible"
      width="80%"
      append-to-body
      :before-close="handleCancelChoose"
    >
      <DatasourceList
        ref="datasourceList"
        table-height="calc(100vh - 25vw)"
        show-selection
        :show-operation="false"
        single-select
        :append-params="{
          project: projectId
        }"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancelChoose">取 消</el-button>
        <el-button v-loading="chooseLoading" type="primary" @click="handleConfirmChoose">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { getInterfaceList, terminateExecuteInterface } from '@/api/interface'
import { updateDatasource } from '@/api/datasource'
import FileUpload from '@/components/FileUpload'
import AppSearch from '@/components/AppSearch'
import Pagination from '@/components/Pagination'
import FilterDialog from './filterDialog'
import ExecutionResult from './executionResult'
import mySocket from '@/websocket'

const baseUrl = process.env.VUE_APP_BASE_API

export default {
  name: 'InterfaceList',
  components: {
    AppSearch,
    Pagination,
    FilterDialog,
    FileUpload,
    ExecutionResult,
    DatasourceList: () => import('@/views/datasource/datasourceList')
  },
  props: {
    appendParams: {
      // 由父组件传入的附加查询条件，应作为 static-data 传给筛选弹窗(FilterDialog)，不应在子组件中被修改，
      type: Object,
      default() {
        return {}
      }
    },
    tableHeight: {
      type: String,
      default: 'auto'
    },
    tableClass: {
      type: [String, Array],
      default: ''
    },
    showSelection: {
      type: Boolean,
      default: false
    },
    showOperation: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    singleSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20
      },
      filterDialogVisible: false,
      filterForm: {
        name: '',
        interface_type: '',
        status: ''
      },
      currInterface: null,
      addDataVisible: false,
      addForm: {
        fileName: '',
        datasourceFile: []
      },
      baseUrl,
      bindDataInterface: null,
      serverList: null,
      excelList: null,
      serverListCache: {},
      runInterfaceVisible: false,
      executionResultVisible: false,
      caseResultList: [],
      datasourceListVisible: false,
      chooseLoading: false,
      refreshTimer: null
    }
  },
  computed: {
    appendParamsCombined() {
      // 最终查询条件是夲组件查询条件(filterForm)与父组件传入的查询条件(appendParams)的组合
      return {
        ...this.filterForm,
        ...this.appendParams
      }
    },
    tableClassCombined() {
      let classes
      if (typeof this.tableClass === 'string') {
        classes = [this.tableClass]
      } else {
        classes = this.tableClass
      }
      return [
        ...classes,
        this.singleSelect ? 'app-single-select-table' : ''
      ]
    },
    projectId() {
      return this.$store.getters.selectedProjectId
    }
  },
  created() {
    this.getInterfaceList()
    // this.startAutoRefreshListener()
  },
  methods: {
    getInterfaceList(isSilence) {
      if (!isSilence) this.listLoading = true
      getInterfaceList({
        page: this.listQuery.page,
        page_size: this.listQuery.limit,
        ...this.appendParamsCombined
      }).then(response => {
        if (!isSilence) {
          this.list = response.data.results
          this.total = response.data.count
          this.listLoading = false
        } else {
          this.list.forEach(obj => {
            const updateObj = response.data.results.find(({ id }) => id === obj.id)
            Object.keys(updateObj).forEach(key => {
              obj[key] = updateObj[key]
            })
          })
          this.total = response.data.count
        }
      })
    },
    startAutoRefreshListener() {
      mySocket({
        listeners: {
          connect: () => {
            console.log('debug connected')
          },
          message: data => {
            if (data && data.is_debug) {
              this.getInterfaceList(true)
            }
          },
          disconnect: () => {
            console.log('debug disconnected')
          }
        }
      })
    },
    refreshInterfaceList() {
      this.listQuery.page = 1
      this.getInterfaceList()
    },
    getSelection() {
      return this.$refs.interfaceList.selection
    },
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    handleFilterSelected(form) {
      this.filterForm.interface_type = form.interface_type
      this.filterForm.status = form.status
      this.$nextTick(_ => {
        this.refreshInterfaceList()
      })
    },
    editInterface(interfaceObj) {
      if (interfaceObj.interface_type === 1) {
        this.$router.push({
          name: 'InterfaceEdit',
          params: {
            projectId: interfaceObj.project,
            interfaceId: interfaceObj.id,
            interface: interfaceObj
          }
        })
      } else if (interfaceObj.interface_type === 2) {
        this.$router.push({
          name: 'BusinessEdit',
          params: {
            projectId: interfaceObj.project,
            interfaceId: interfaceObj.id,
            interface: interfaceObj
          }
        })
      }
    },
    runInterface(interfaceObj) {
      this.$router.push({
        name: 'InterfaceExecute',
        params: {
          interfaceId: interfaceObj.id,
          interfaceObj
        }
      })
    },
    terminateInterface(interfaceObj) {
      this.$confirm('确认停止接口运行？').then(_ => {
        this.listLoading = true
        terminateExecuteInterface({
          interfaceid: [interfaceObj.id]
        }).then(_ => {
          this.$message({
            message: '已停止接口运行',
            type: 'success'
          })
          this.getInterfaceList()
        }).catch(e => {
          this.$message({
            message: e.data.tip || e.message,
            type: 'error'
          })
        }).finally(_ => {
          this.listLoading = false
        })
      }).catch(_ => {})
    },
    bindData(interfaceObj) {
      if (interfaceObj.source_title) {
        const fileName = interfaceObj.source_title
        this.addForm.fileName = fileName
        this.addForm.datasourceFile = [{
          name: fileName
        }]
      } else {
        this.addForm.fileName = ''
        this.addForm.datasourceFile = []
      }

      this.addDataVisible = true
      this.bindDataInterface = interfaceObj
    },
    checkResult(interfaceObj) {
      this.$router.push({
        name: 'InterfaceExecuteResult',
        params: {
          id: interfaceObj.id,
          name: interfaceObj.name
        }
      })
    },
    handleUploadSuccess(res) {
      // 上传完成后 调绑定接口
      const { data } = res
      const id = data.id
      if (!id) {
        this.$message({
          type: 'error',
          message: '上传失败'
        })
        return
      }
      updateDatasource({
        id
      }, {
        interface: this.bindDataInterface.id
      }).then(_ => {
        this.addDataVisible = false
        // 去除接口excel缓存 以获取最新excel数据
        this.$message({
          type: 'success',
          message: '绑定成功'
        })
      })
    },
    handleUploadError(e) {
      this.$message({
        type: 'error',
        message: e.message
      })
    },
    handleChooseExisted() {
      this.datasourceListVisible = true
    },
    handleCancelUpload() {
      this.addDataVisible = false
    },
    handleConfirmUpload() {
      if (!this.addForm.fileName) {
        this.$message({
          message: '请输入文件名',
          type: 'error'
        })
        return
      }
      if (!(this.bindDataInterface && this.bindDataInterface.project)) {
        this.$message({
          message: '数据不全',
          type: 'error'
        })
        return
      }
      if (!this.$refs.uploadDatasource.fileList.length) {
        this.$message({
          message: '请上传文件',
          type: 'error'
        })
        return
      }
      this.$refs.uploadDatasource.submit()
    },
    handleSelectionChange(selection) {
      if (this.singleSelect) {
        if (selection.length > 1) {
          const lastRow = selection.pop()
          this.$refs.interfaceList.clearSelection()
          this.$refs.interfaceList.toggleRowSelection(lastRow, true)
        }
      }
      this.$emit('selection-change', selection)
    },
    handleCancelChoose() {
      this.datasourceListVisible = false
    },
    handleConfirmChoose() {
      if (this.chooseLoading) return
      const [datasource] = this.$refs.datasourceList.getSelection()
      const { id } = datasource
      this.chooseLoading = true
      updateDatasource({
        id
      }, {
        interface: this.bindDataInterface.id
      }).then(_ => {
        this.addDataVisible = false
        this.datasourceListVisible = false
        this.getInterfaceList()
        this.$message({
          type: 'success',
          message: '绑定成功'
        })
      }).finally(_ => {
        this.chooseLoading = false
      })
    },
    clearSelection() {
      this.$refs.interfaceList.clearSelection()
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.interface-list-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .interface-search {
    padding: 10px 0 20px 0;
    white-space: nowrap;
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
  }

  .interface-tools {
    min-height: 50px;
    padding: 10px 5px;
    border: 1px solid $colorGray;
  }

  .interface-main {
    flex-grow: 1;
    border-top: none;
    overflow: hidden;
    >>> .el-table {
      thead {
        color: #333;
        th {
          background: #f7f9fc;
        }
      }
      .el-table__body tr {
        &:hover> td {
          background: rgba(0,144,218,0.10);
        }
        &.current-row> td {
          background: rgba(204, 238, 236, .5)
        }
      }
    }

    >>> .el-table th>.cell {
      line-height: 36px;
    }
    .operation-button-group {
      > span {
        font-size: 14px;
        color: #0090DA;
        margin: 10px;
        cursor: pointer;
      }
    }
  }

  >>> .el-table__header-wrapper, >>> .el-table__body-wrapper {
    > table, .el-table__empty-block {
      width: auto !important;
    }
  }
}
</style>

