<template>
  <div class="run-interface-container">
    <div>
      <div>
        <div class="run-interface-title mgt0">
          运行-环境选择
        </div>
        <el-form
          ref="executeForm"
          label-position="left"
          :model="form"
          :rules="executeInterfaceRules"
          :inline="true"
        >
          <el-form-item label="目标服务器选择" prop="server" label-width="150px">
            <el-select v-model="form.server">
              <el-option v-for="server of serverList" :key="server.id" :label="server.name" :value="server.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="执行机" prop="executeion" label-width="80px" class="mgl20">
            <el-select v-model="form.executeion">
              <el-option v-for="executor of executorList" :key="executor.id" :label="executor.name" :value="executor.ip" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="run-interface-title">
          用例选择
        </div>
        <div class="run-interface-search">
          <AppSearch v-model="excelListFilterText" class="run-interface-search-input" @query="refreshExcelList" />
        </div>
      </div>
      <el-table
        v-if="excelList"
        ref="caseList"
        v-loading="fetchDataLoading"
        :data="excelListFormated"
        element-loading-text="Loading"
        fit
        highlight-current-row
        class="app-list-table"
        height="calc(100vh - 20.83vw)"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column align="center" label="用例名称">
          <template slot-scope="scope">
            {{ scope.row.TestName.value }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="用例说明">
          <template slot-scope="scope">
            {{ scope.row.TestDesc.value }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="用例标签">
          <template slot-scope="scope">
            {{ scope.row.TestTags.value }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <span v-loading="executeLoading" class="app-btn app-btn-blue" type="primary" @click="handleConfirm">运 行</span>
        <span class="app-btn app-btn-white" @click="handleCancel">返 回</span>
      </span>
    </div>
  </div>
</template>
<script>
import { getExecutor } from '@/api/user'
import { executeInterface, getExcelByInterface, getInterfaceInfo } from '@/api/interface'
import { getProjectEnv } from '@/api/project'
import executeInterfaceRules from '@/rules/executeInterfaceRules'
import AppSearch from '@/components/AppSearch'
export default {
  components: {
    AppSearch
  },
  data() {
    return {
      form: {
        server: '',
        executeion: ''
      },
      excelList: [],
      serverList: [],
      executorList: [],
      executeInterfaceRules,
      executionResultVisible: false,
      fetchDataLoading: false,
      page: 0,
      pageSize: 15,
      excelListFilterText: '',
      excelListFilterTextConfirmed: '',
      executeLoading: false
    }
  },
  computed: {
    interfaceObj() {
      return this.$route.params.interfaceObj
    },
    excelListFormated() {
      if (this.excelList) {
        return this.excelList.map(({ other, id }) => {
          return {
            ...other,
            id
          }
        }).filter(caseItem => {
          const testName = caseItem.TestName.value
          if (this.excelListFilterTextConfirmed) {
            return testName.indexOf(this.excelListFilterTextConfirmed) > -1
          } else {
            return true
          }
        })
      } else {
        return []
      }
    },
    hasMoreExcel() {
      return this.page * this.pageSize < this.excelTotal
    }
  },
  beforeRouteEnter(to, from, next) {
    if (!to.params.interfaceObj) {
      getInterfaceInfo({
        id: to.params.interfaceId
      }).then(res => {
        to.params.interfaceObj = res.data
        next()
      })
    } else {
      next()
    }
  },
  created() {
    const { project } = this.interfaceObj
    this.getServerList(project)
    this.getExecutorList()
    this.fetchExcel().then(_ => {
      this.$nextTick(_ => {
        // 如果tablebody高度大于wrapper高度 添加scroll事件
        const tableContainer = this.$refs.caseList.$el
        const tableWrapper = tableContainer.querySelector('.el-table__body-wrapper')
        const tableBody = tableContainer.querySelector('.el-table__body')
        if (tableBody.offsetHeight > tableWrapper.offsetHeight) {
          tableWrapper.addEventListener('scroll', () => {
            if (this.hasMoreExcel && tableWrapper.offsetHeight + tableWrapper.scrollTop >= tableBody.offsetHeight) {
              if (this.fetchDataLoading) return
              this.fetchDataLoading = true
              this.fetchExcel().finally(_ => {
                this.fetchDataLoading = false
              })
            }
          })
        }
      })
    })
  },
  methods: {
    fetchExcel() {
      return getExcelByInterface({
        id: this.interfaceObj.id
      }, {
        page: this.page + 1,
        page_size: this.pageSize
      }).then(res => {
        const data = res.data
        if (data.excle_list.length) {
          this.page++
          this.excelList.push(...data.excle_list)
          this.excelTotal = data.count
        }
      })
    },
    getServerList(projectId) {
      getProjectEnv({
        project: projectId
      }).then(({ data }) => {
        this.serverList = data
      })
    },
    getExecutorList() {
      getExecutor().then(({ data }) => {
        this.executorList = data
      })
    },
    handleCancel() {
      this.$router.go(-1)
    },
    handleConfirm() {
      if (this.executeLoading) return
      this.validateForm()
        .then(_ => {
          this.executeLoading = true
          return this.executeInterface()
        })
        .then(res => {
          this.$message({
            message: '运行成功',
            type: 'success'
          })
          this.$router.go(-1)
        }).catch(err => {
          if (err) {
            this.$message({
              message: err.data ? err.data.tip : err.message,
              type: 'error'
            })
          }
        }).finally(_ => {
          this.executeLoading = false
        })
    },
    validateForm() {
      return this.$refs.executeForm.validate().then(_ => {
        const case_id = this.$refs.caseList.selection.map(({ id }) => id)
        if (!case_id.length) {
          return Promise.reject(new Error('请选择用例'))
        }
        return Promise.resolve()
      })
    },
    executeInterface() {
      const case_id = this.$refs.caseList.selection.map(({ id }) => id)
      return executeInterface({
        interface_id: [this.interfaceObj.id],
        case_id,
        server_id: this.form.server,
        executive_machine: this.form.executeion
      })
    },
    refreshExcelList() {
      this.excelListFilterTextConfirmed = this.excelListFilterText
    }
  }
}
</script>

<style scoped lang="scss">

  .run-interface-container {
    min-height: 100vh;
    padding: 40px 30px 90px;

    .app-btn {
      height: 40px;
      line-height: 40px;
    }

    .run-interface-title {
      font-size: 20px;
      margin: 20px 0 30px 8px;
      &.mgt0 {
        margin-top: 0
      }
    }

    .run-interface-search {
      margin-bottom: 30px;
      &-input {
        width: 1000px;
      }
    }

    .dialog-footer {
      position: absolute;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .mgl20 {
      margin-left: 20px;
    }
  }
</style>
