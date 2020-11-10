<template>
  <div class="project-list-container">
    <div class="project-search">
      <AppSearch v-model="filterForm.name" class="project-search-input" @query="handleFilterConfirmed" />
      <svg-icon icon-class="filter" class="project-search-filter" @click="showFilterDialog" />
    </div>
    <div class="project-tools">
      <slot name="tableHead" />
    </div>
    <div class="project-main">
      <div class="title">项目列表</div>
      <el-table
        ref="projectList"
        v-loading="listLoading"
        class="app-list-table"
        :data="list"
        element-loading-text="Loading"
        fit
        highlight-current-row
        :height="tableHeight"
      >
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
        />
        <el-table-column align="center" label="项目编号" width="95">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="项目名称">
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column label="项目优先级" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.level | projectLevel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="项目时间" width="400" align="center">
          <template slot-scope="scope">
            {{ scope.row.start_time | parseToDate }} - {{ scope.row.end_time | parseToDate }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="状态" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.status ? '启用' : '停用' }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="showOperation" label="操作" width="250" align="center">
          <template slot-scope="scope">
            <div class="operation-button-group">
              <span @click="editTemplate(scope.row)">模板</span>
              <span @click="editProject(scope.row)">编辑</span>
              <span @click="enviromentManage(scope.row)">环境</span>
              <span @click="userManage(scope.row)">人员</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getProjectList" />

      <FilterDialog
        :visible.sync="filterDialogVisible"
        :default-data="filterForm"
        @selected="handleFilterSelected"
      />
    </div>
  </div>
</template>

<script>
import { getProjectList } from '@/api/project'
import AppSearch from '@/components/AppSearch'
import Pagination from '@/components/Pagination'
import FilterDialog from './filterDialog'

export default {
  components: {
    AppSearch,
    Pagination,
    FilterDialog
  },
  props: {
    tableHeight: {
      type: String,
      default: 'auto'
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
        limit: 10
      },
      filterDialogVisible: false,
      filterForm: {
        level: null,
        status: null,
        name: ''
      },
      filterFormConfirmed: {
      },
      selectedProject: false
    }
  },

  computed: {
    appendParams() {
      return {
        ...this.filterFormConfirmed
      }
    }
  },

  created() {
    this.getProjectList()
  },

  methods: {
    getProjectList() {
      this.listLoading = true
      getProjectList({
        page: this.listQuery.page,
        page_size: this.listQuery.limit,
        ...this.appendParams
      }).then(response => {
        this.list = response.data.results
        this.total = response.data.count
        this.listLoading = false
      })
    },
    refreshProjectList() {
      this.listQuery.page = 1
      this.getProjectList()
    },
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    handleFilterSelected(form) {
      Object.keys(form).forEach(key => {
        this.filterForm[key] = form[key]
      })
      this.confirmFilterForm()
      this.$nextTick(_ => this.refreshProjectList())
    },
    editTemplate(project) {
      this.$router.push({
        name: 'projectTemplateEdit',
        params: { id: project.id }
      })
    },
    editProject(project) {
      this.$router.push({
        name: 'projectEdit',
        params: { project }
      })
    },
    enviromentManage(project) {
      this.$router.push({
        name: 'projectEnv',
        params: { id: project.id }
      })
    },
    userManage(project) {
      this.$router.push({
        name: 'projectUsers',
        params: { project }
      })
    },
    getSelection() {
      return this.$refs.projectList.selection
    },
    handleFilterConfirmed() {
      this.confirmFilterForm()
      console.log(this.filterFormConfirmed.name)
      this.$nextTick(_ => this.refreshProjectList())
    },
    confirmFilterForm() {
      this.filterFormConfirmed = {
        ...this.filterFormConfirmed,
        ...this.filterForm
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.project-list-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .project-search {
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
  }

  .project-main {
    background: #f7f9fc;
    border: 10px solid #D9D9D7;
    padding: 20px 20px 0;
    flex-grow: 1;
    .title {
      font-size: 20px;
      margin-bottom: 10px;
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
