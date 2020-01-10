<template>
  <div class="datasource-list-container">
    <div class="datasource-tools">
      <slot name="tableHead" />
      <div style="float: right">
        <el-button size="small" plain @click="showFilterDialog">filter</el-button>
        <AppSearch v-model="form.query" />
      </div>
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
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
        />
        <el-table-column align="center" label="文件名" >
          <template slot-scope="scope">
            {{ scope.row.title }}
          </template>
        </el-table-column>
        <el-table-column label="关联接口/流程">
          <template slot-scope="scope">
            {{ scope.row.author }}
          </template>
        </el-table-column>
        <el-table-column label="项目优先级" width="200" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.updated }}
          </template>
        </el-table-column>
        <el-table-column v-if="showOperation" label="操作" width="250" align="center">
          <template slot-scope="scope">
            <el-tag
              type="warning"
              @click="uploadData(scope.row)"
            >上传</el-tag>
            <el-tag
              @click="downloadData(scope.row)"
            >下载</el-tag>
            <el-tag
              type="info"
              @click="deleteData(scope.row)"
            >删除</el-tag>
            <el-tag type="success"
              @click="bindData(scope.row)">绑定</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getDatasourceList" />
      
      <FilterDialog
        :visible.sync="filterDialogVisible"
        :default-data="filterForm"
        @selected="handleFilterSelected"
      />
    <el-dialog
      title="选择绑定接口"
      :visible="interfaceVisible"
      :before-close="_ => interfaceVisible = false"
      append-to-body
      
      width="80%"
    >
      <InterfaceList ref="interfaceList" table-height="calc(100vh - 300px)"
        :show-operation="false"
        show-selection
        singleSelect
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
import InterfaceList from '@/views/interface/interfaceList'
import { getDatasourceList, updateDatasource } from '@/api/datasource'

export default {
  components: {
    AppSearch,
    Pagination,
    FilterDialog,
    InterfaceList
  },
  props: {
    appendParams: {
      type: Object,
      default() {
        return {}
      }
    },
    tableHeight: {
      type: String
    },
    showSelection: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    showOperation: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      form: {
        query: ''
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

  watch: {
    appendParams() {
      this.getDatasourceList()
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
    },
    deleteData(datasource) {
    },
    bindData(datasource) {
      this.interfaceVisible = true
      this.currDatasource = datasource
    },
    handleConfirmChoose() {
      const selection = this.$refs.interfaceList.getSelection()
      console.log(selection)
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
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.datasource-list-container {
  width: 100%;
  height: 100%;

  .datasource-tools {
    min-height: 50px;
    padding: 10px 5px;
    border: 1px solid $colorGray;
  }
}
</style>
