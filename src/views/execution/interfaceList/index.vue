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
        @selection-change="$emit('selectionChange')"
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
            {{ scope.row.step }}
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
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getExcutionInterface" />
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
  </div>
</template>

<script>
import { excuteInterface, terminateExcuteInterface } from '@/api/interface'
import { getExcutionInterface } from '@/api/excution'
import { getProjectEnv } from '@/api/project'

import Pagination from '@/components/Pagination'

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
      excutionDialogvisible: false,
      currInterface: null,
      form: {
        server: '',
        excuteion: '127.0.0.1'
      },
      isExcutionLoading: false
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
    this.getExcutionInterface()
  },
  methods: {
    getExcutionInterface() {
      if (this.id) {
        this.listLoading = true
        getExcutionInterface({
          id: this.id
        }, {
          ...this.appendParams,
          page: this.listQuery.page,
          page_size: this.listQuery.limit
        }).then(response => {
          this.list = response.data.results
          this.total = response.data.count
          this.listLoading = false
        })
      } else {
        this.list = []
        this.total = 0
      }
    },
    refreshInterfaceList() {
      this.listQuery.page = 1
      this.getExcutionInterface()
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
        this.excutionDialogvisible = true
      })
    },
    excuteInterface() {
      const interfaceId = this.currInterface.id
      return excuteInterface({
        interface_id: [interfaceId],
        server_id: this.form.server,
        executive_machine: this.form.excuteion,
        isdebug: false
      })
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
            message: err.data.tip || err.message,
            type: 'error'
          })
        }
      }).finally(_ => {
        this.isExcutionLoading = false
      })
    },
    getSelection() {
      return this.$refs.interfaceList.selection
    },
    terminateInterface(interfaceObj) {
      this.$confirm('确认停止接口运行？').then(_ => {
        this.listLoading = true
        terminateExcuteInterface({
          interfaceid: [interfaceObj.id],
          isdebug: false
        }).then(_ => {
          this.$message({
            message: '已停止接口运行',
            type: 'success'
          })
          this.getExcutionInterface()
        }).catch(e => {
          this.$message({
            message: e.data.tip || e.message,
            type: 'error'
          })
        }).finally(_ => { this.listLoading = false })
      }).catch(_ => {})
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
    padding: 10px 20px 19px 20px;
    background: #F2F2F2;
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
