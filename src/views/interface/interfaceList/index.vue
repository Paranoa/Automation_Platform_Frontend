<template>
  <div class="interface-list-container">
    <div class="interface-tools">
      <slot name="tableHead" />
      <div style="float: right">
        <el-button size="small" plain @click="showFilterDialog">filter</el-button>
        <AppSearch v-model="filterForm.query" />
      </div>
    </div>
    <div class="interface-main">
      <el-table
        ref="interfaceList"
        v-loading="listLoading"
        :data="list"
        :class="{ 'table-hide-selection': singleSelect }"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        :height="tableHeight"
        @selection-change="handleSelectionChange"
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
            {{ scope.row.type || '接口' }}
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
            <i class="el-icon-time" />
            <span>{{ scope.row.created }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改人" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.modifier }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="showOperation" label="操作" width="230" align="center">
          <template slot-scope="scope">
            <el-tag type="info">查看</el-tag>
            <el-tag type="info">运行</el-tag>
            <el-tag type="success">绑定</el-tag>
            <el-tag @click="editInterface(scope.row)">编辑</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getInterfaceList" />
      <FilterDialog
        :visible.sync="filterDialogVisible"
        :default-data="filterForm"
        @selected="handleFilterSelected"
      />
      <AddInterface v-if="currInterface"
      :visible.sync="addInterfaceVisible" :interface="currInterface"/>
    </div>
  </div>
</template>

<script>
import { getInterfaceList, addInterface } from '@/api/interface';
import AppSearch from '@/components/AppSearch'
import Pagination from '@/components/Pagination'
import FilterDialog from './filterDialog'
import AddInterface from '../addInterface'

export default {
  components: {
    AppSearch,
    Pagination,
    FilterDialog,
    AddInterface
  },
  props: {
    appendParams: {
      type: Object,
      default() {
        return {}
      }
    },
    singleSelect: {
      type: Boolean,
      default: false
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
      currInterface: null,
      addInterfaceVisible: false
    }
  },
  watch: {
    appendParams() {
      this.getInterfaceList()
    }
  },
  created() {
    this.getInterfaceList()
  },
  methods: {
    getInterfaceList() {
      this.listLoading = true
      getInterfaceList({
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
      return this.$refs.interfaceList.selection
    },
    handleSelectionChange(selection) {
      if (this.singleSelect && selection.length > 1) {
        this.$refs.interfaceList.clearSelection()
        this.$refs.interfaceList.toggleRowSelection(selection.pop(), true)
      }
    },
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    handleFilterSelected(form) {
      console.log(form)
      this.filterForm = form
    },
    editInterface(interfaceObj) {
      console.log(interfaceObj)
      this.currInterface = interfaceObj
      this.addInterfaceVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.interface-list-container{
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .interface-tools {
    min-height: 50px;
    padding: 10px 5px;
    border: 1px solid $colorGray;
  }

  .interface-main {
    flex-grow: 1;
    border: 1px solid $colorGray;
    border-top: none;
    overflow: hidden;

    .table-hide-selection {
      >>> thead .el-table-column--selection .cell{
        display: none;
      }
    }
  }
}
</style>

