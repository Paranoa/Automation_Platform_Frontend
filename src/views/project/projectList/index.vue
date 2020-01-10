<template>
  <div class="project-list-container">
    <div class="project-tools">
      <slot name="tableHead" />
      <div style="float: right">
        <el-button size="small" plain @click="showFilterDialog">filter</el-button>
        <AppSearch v-model="form.query" />
      </div>
    </div>
    <div class="project-main">
      <el-table
        ref="projectList"
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
            <el-tag
              type="warning"
              @click="editProject(scope.row)"
            >编辑</el-tag>
            <el-tag
              @click="enviromentManage(scope.row)"
            >环境</el-tag>
            <el-tag
              type="info"
              @click="userManage(scope.row)"
            >人员</el-tag>
            <el-tag type="success">导出</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getProjectList" />

      <FilterDialog
        :visible.sync="filterDialogVisible"
        :default-data="filterForm"
        @selected="handleFilterSelected"
      />

      <AddProject
        v-if="selectedProject"
        :project="selectedProject"
        :visible.sync="editProjectVisible"
        @finished="getProjectList"
      />

      <EnvironmentManage
        v-if="selectedProject"
        :project="selectedProject"
        :visible.sync="environmentManageVisible"
      />

      <UserManage
        v-if="selectedProject"
        :project="selectedProject"
        :visible.sync="userManageVisible"
      />
    </div>
  </div>
</template>

<script>
import { getProjectList } from '@/api/project'
import AppSearch from '@/components/AppSearch'
import Pagination from '@/components/Pagination'
import FilterDialog from './filterDialog'

const AddProject = () => import('../addProject')
const EnvironmentManage = () => import('./environmentManage')
const UserManage = () => import('./userManage')

export default {
  components: {
    AppSearch,
    Pagination,
    FilterDialog,
    AddProject,
    EnvironmentManage,
    UserManage
  },
  props: {
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
        limit: 10
      },
      filterDialogVisible: false,
      filterForm: {
        name: 'zw'
      },
      selectedProject: false,
      editProjectVisible: false,
      environmentManageVisible: false,
      userManageVisible: false
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
        page_size: this.listQuery.limit
      }).then(response => {
        this.list = response.data.results
        this.total = response.data.count
        this.listLoading = false
      })
    },
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    handleFilterSelected(form) {
      this.filterForm = form
    },
    editProject(project) {
      this.selectedProject = project
      this.editProjectVisible = true
    },
    enviromentManage(project) {
      this.selectedProject = project
      this.environmentManageVisible = true
    },
    userManage(project) {
      this.selectedProject = project
      this.userManageVisible = true
    },
    getSelection() {
      return this.$refs.projectList.selection
    }
  }
}
</script>

<style lang="scss" scoped>
$colorGray: #DCDFE6;

.project-list-container {
  width: 100%;
  height: 100%;

  .project-tools {
    min-height: 50px;
    padding: 10px 5px;
    border: 1px solid $colorGray;
  }
}
</style>
