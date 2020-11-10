<template>
  <div class="interface-list-container">
    <div class="interface-main">
      <el-table
        ref="interfaceList"
        v-loading="listLoading"
        fit
        highlight-current-row
        element-loading-text="Loading"
        :data="list"
        :height="tableHeight"
        :class="tableClass"
        :empty-text="emptyText"
        @selection-change="$emit('selection-change')"
      >
        <el-table-column v-if="showSelection" type="selection" width="55" />
        <el-table-column align="center" label="编号" width="95">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="名称">
          <template slot-scope="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column label="类型">
          <template slot-scope="scope">{{ scope.row.interface_type | interfaceType }}</template>
        </el-table-column>
        <el-table-column label="描述" width="200" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.desc }}</span>
          </template>
        </el-table-column>
        <el-table-column label="步骤" align="center">
          <template slot-scope="scope">{{ scope.row.step }}</template>
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
            <template v-if="scope.row.exec_status === 1">
              <span @click="runInterface(scope.row)">运行</span>
            </template>
            <template v-else-if="scope.row.exec_status === 2">
              <span @click="terminateInterface(scope.row)">停止</span>
              <span @click="checkReport(scope.row)">查看报告</span>
            </template>
            <template v-else-if="scope.row.exec_status === 3">
              <span @click="runInterface(scope.row)">运行</span>
              <span @click="checkReport(scope.row)">查看报告</span>
            </template>
            <span
              v-loading="loading"
              @click="
                () => {
                  loading = true
                  $emit('timed-task', scope.row, (promise) => {
                    promise.finally(() => {
                      loading = false
                    })
                  })
                }
              "
            >查看定时任务</span>
          </div>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getExecutionInterface"
      />
      <el-dialog
        title="选择运行环境"
        width="20%"
        append-to-body
        :visible="executionDialogvisible"
        :before-close="(_) => (executionDialogvisible = false)"
      >
        <el-form
          ref="executeForm"
          label-position="left"
          label-width="130px"
          :model="form"
          :rules="{
            server: [{ required: true, trigger: 'change', message: '请选择环境' }],
            executor: [{ required: true, trigger: 'blur', message: '请输入执行机' }]
          }"
        >
          <el-form-item label="目标环境选择：" prop="server">
            <el-select v-model="form.server" style="width: 100%">
              <el-option
                v-for="server of serverList"
                :key="server.id"
                :label="server.name"
                :value="server.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="执行机：" prop="executor">
            <el-select v-model="form.executor">
              <el-option
                v-for="executor of executorList"
                :key="executor.id"
                :label="executor.name"
                :value="executor.ip"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="executionDialogvisible = false">取 消</el-button>
          <el-button
            v-loading="isExecutionLoading"
            type="primary"
            @click="handleExecutionConfirm"
          >确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="查看报告"
        :visible="reportVisible"
        width="40%"
        :before-close="(_) => (reportVisible = false)"
        append-to-body
      >
        <div class="report-list-container">
          <template v-if="reportList.length">
            <div v-for="(report, index) of reportList" :key="report.id" class="report-list">
              <span>第{{ index + 1 }}次执行：</span>
              <a class="app-link-blue" :href="report.log_url" target="_blank">{{ report.log_url }}</a>
            </div>
          </template>
          <template v-else>
            <div class="report-empty">-- 暂无报告 --</div>
          </template>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="reportVisible = false">返 回</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getExecutor } from '@/api/user'
import { executeInterface, terminateExecuteInterface, getReport } from '@/api/interface'
import { getExecutionInterface } from '@/api/execution'
import { getProjectEnv } from '@/api/project'
import Pagination from '@/components/Pagination'
import mySocket from '@/websocket'

export default {
  components: {
    Pagination
  },
  props: {
    appendParams: {
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
      type: String,
      default: ''
    },
    showSelection: {
      type: Boolean,
      default: false
    },
    showOperation: {
      type: Boolean,
      default: true
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
      serverList: [],
      executionDialogvisible: false,
      currInterface: null,
      form: {
        server: '',
        executor: ''
      },
      isExecutionLoading: false,
      executorList: [],
      reportVisible: false,
      reportList: [],
      refreshScoket: null,
      loading: false
    }
  },
  computed: {
    id() {
      return this.appendParams.id
    },
    emptyText() {
      if (!this.id) {
        return '请选择执行集'
      } else {
        return '暂无数据'
      }
    }
  },
  created() {
    this.getExecutionInterface()
    this.getExecutorList()
  },
  methods: {
    getExecutionInterface(isSilence) {
      if (!this.id) {
        this.list = []
        this.total = 0
        return
      }
      if (!isSilence) this.listLoading = true
      getExecutionInterface(
        {
          id: this.id
        },
        {
          ...this.appendParams,
          page: this.listQuery.page,
          page_size: this.listQuery.limit
        }
      )
        .then((response) => {
          if (!isSilence) {
            this.list = response.data.results
            this.total = response.data.count
          } else {
            this.list.forEach((obj) => {
              const updateObj = response.data.results.find(({ id }) => id === obj.id)
              Object.keys(updateObj).forEach((key) => {
                obj[key] = updateObj[key]
              })
            })
            this.total = response.data.count
          }
        })
        .finally((_) => {
          this.listLoading = false
        })
    },
    getExecutorList() {
      getExecutor().then(({ data }) => {
        this.executorList = data
      })
    },
    refreshInterfaceList() {
      this.listQuery.page = 1
      this.getExecutionInterface()
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
      getProjectEnv({
        project: interfaceObj.project
      }).then(({ data }) => {
        this.serverList = data
        this.currInterface = interfaceObj
        this.executionDialogvisible = true
      })
    },
    startAutoRefreshListener() {
      if (!this.refreshScoket) {
        this.refreshScoket = mySocket({
          listeners: {
            connect: () => {
              console.log('execute connected')
            },
            message: (data) => {
              if (data && !data.is_debug) {
                this.getExecutionInterface(true)
              }
            },
            disconnect: () => {
              console.log('execute disconnected')
            }
          }
        })
      }
    },
    executeInterface() {
      const interfaceId = this.currInterface.id
      return executeInterface({
        interface_id: [interfaceId],
        server_id: this.form.server,
        executive_machine: this.form.executor,
        isdebug: false
      })
    },
    handleExecutionConfirm() {
      if (this.isExecutionLoading) return
      this.isExecutionLoading = true
      this.$refs.executeForm
        .validate()
        .then(this.executeInterface)
        .then((res) => {
          this.$message({
            message: '运行成功',
            type: 'success'
          })
          this.executionDialogvisible = false
          // this.startAutoRefreshListener()
        })
        .catch((err) => {
          if (err) {
            this.$message({
              message: err.data.tip || err.message,
              type: 'error'
            })
          }
        })
        .finally((_) => {
          this.isExecutionLoading = false
        })
    },
    getSelection() {
      return this.$refs.interfaceList.selection
    },
    checkReport(interfaceObj) {
      getReport({
        interface: interfaceObj.id
      }).then((res) => {
        this.reportList = res.data
        this.reportVisible = true
      })
    },
    terminateInterface(interfaceObj) {
      this.$confirm('确认停止接口运行？')
        .then((_) => {
          this.listLoading = true
          terminateExecuteInterface({
            interfaceid: [interfaceObj.id],
            isdebug: false
          })
            .then((_) => {
              this.$message({
                message: '已停止接口运行',
                type: 'success'
              })
              this.getExecutionInterface()
            })
            .catch((e) => {
              this.$message({
                message: e.data.tip || e.message,
                type: 'error'
              })
            })
            .finally((_) => {
              this.listLoading = false
            })
        })
        .catch((_) => {})
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #dcdfe6;

.interface-list-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .interface-search {
    padding: 10px 20px 19px 20px;
    background: #f2f2f2;
    white-space: nowrap;
    &-input {
      width: 1000px;
    }
    &-filter {
      font-size: 20px;
      margin-left: 30px;
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
        &:hover > td {
          background: rgba(0, 144, 218, 0.1);
        }
        &.current-row > td {
          background: rgba(204, 238, 236, 0.5);
        }
      }
    }

    >>> .el-table th > .cell {
      line-height: 36px;
    }
    .operation-button-group {
      > span {
        font-size: 14px;
        color: #0090da;
        margin: 10px;
        cursor: pointer;
      }
    }
  }

  >>> .el-table__header-wrapper,
  >>> .el-table__body-wrapper {
    > table,
    .el-table__empty-block {
      width: auto !important;
    }
  }
}

.report-list-container {
  height: 350px;
  overflow: auto;
  .report-list {
    line-height: 3;
    display: flex;
    border-bottom: 1px dashed #ccc;
    > span {
      width: 8em;
      text-align: right;
      margin-right: 20px;
    }
  }
  .report-empty {
    font-size: 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
