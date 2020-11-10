<template>
  <div class="datasource-list-container">
    <div v-if="showSearch" class="datasource-search">
      <AppSearch v-model="form.title" class="datasource-search-input" />
      <svg-icon icon-class="filter" class="datasource-search-filter" @click="showFilterDialog" />
    </div>
    <div class="datasource-main">
      <el-table
        ref="datasourceList"
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        :height="tableHeight"
        class="app-list-table"
        :class="tableClassCombined"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
        />
        <el-table-column align="center" label="文件名">
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="关联接口/流程">
          <template slot-scope="scope">
            {{ scope.row.interfacename || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.updated | parseToDate }}
          </template>
        </el-table-column>
        <el-table-column v-if="showOperation" label="操作" width="250" align="center">
          <div slot-scope="scope" class="operation-button-group">
            <span
              @click="uploadData(scope.row)"
            >上传</span>
            <span
              @click="downloadData(scope.row)"
            >下载</span>
            <span
              @click="deleteData(scope.row)"
            >删除</span>
            <span
              type="success"
              @click="bindData(scope.row)"
            >绑定</span>
          </div>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getDatasourceList" />

      <FilterDialog
        :visible.sync="filterDialogVisible"
        :default-data="filterForm"
        @selected="handleFilterSelected"
      />
      <el-dialog
        v-if="showOperation"
        title="选择绑定接口"
        :visible="interfaceVisible"
        :before-close="_ => interfaceVisible = false"
        append-to-body
        width="80%"
      >
        <InterfaceList
          ref="interfaceList"
          table-height="calc(100vh - 25vw)"
          :show-operation="false"
          show-selection
          single-select
          table-class="app-list-table"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="interfaceVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirmChoose">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import AppSearch from '@/components/AppSearch'
import Pagination from '@/components/Pagination'
import FilterDialog from './filterDialog'
import { getDatasourceList, updateDatasource, deleteDatasource } from '@/api/datasource'

export default {
  name: 'DatasourceList',
  components: {
    AppSearch,
    Pagination,
    FilterDialog,
    InterfaceList: () => import('@/views/interface/interfaceList')
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
      type: [String, Array],
      default: ''
    },
    showSelection: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    showOperation: {
      type: Boolean,
      default: true
    },
    singleSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        title: ''
      },
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20
      },
      filterDialogVisible: false,
      filterForm: {
        name: 'zw'
      },
      currDatasource: null,
      interfaceVisible: false
    }
  },
  computed: {
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
    }
  },
  created() {
    this.getDatasourceList()
  },
  methods: {
    getDatasourceList() {
      this.listLoading = true
      getDatasourceList({
        page: this.listQuery.page,
        page_size: this.listQuery.limit,
        ...this.appendParams
      }).then(response => {
        this.list = response.data.results
        this.total = response.data.count
        this.listLoading = false
      })
    },
    getSelection() {
      return this.$refs.datasourceList.selection
    },
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    handleFilterSelected(form) {
      this.filterForm = form
    },
    uploadData(datasource) {
      this.$emit('editDatasource', datasource)
    },
    downloadData(datasource) {
      const origin = process.env.VUE_APP_FILE_SERVER
      window.open(origin + datasource.file_name)
    },
    deleteData(datasource) {
      this.$confirm('将删除数据源, 是否继续?', '提示').then(_ => {
        const ids = [datasource.id]
        deleteDatasource({
          ids
        }).then(_ => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getDatasourceList()
        }).catch(_ => {})
      })
    },
    bindData(datasource) {
      this.interfaceVisible = true
      this.currDatasource = datasource
    },
    handleConfirmChoose() {
      const selection = this.$refs.interfaceList.getSelection()
      const interfaceId = selection[0].id

      updateDatasource({
        id: this.currDatasource.id
      }, {
        interface: interfaceId
      }).then(_ => {
        this.interfaceVisible = false
        this.$message({
          type: 'success',
          message: '绑定成功'
        })
        this.$refs.interfaceList.clearSelection()
      })
    },
    handleSelectionChange(selection) {
      if (this.singleSelect) {
        if (selection.length > 1) {
          const lastRow = selection.pop()
          this.$refs.datasourceList.clearSelection()
          this.$refs.datasourceList.toggleRowSelection(lastRow, true)
        }
      }
      this.$emit('selection-change', selection)
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.datasource-list-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  .datasource-search {
    padding: 10px 20px 19px 20px;
    background: #F2F2F2;
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

  .datasource-tools {
    min-height: 50px;
    padding: 10px 15px;
  }

  .datasource-main {
    .title {
      font-size: 20px;
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
}
</style>
