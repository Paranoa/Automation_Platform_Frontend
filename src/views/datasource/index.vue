<template>
  <div>
    <Navbar />
    <div class="datasource-container">
      <div class="datasource-search">
        <AppSearch v-model="form.title" class="datasource-search-input" @query="refreshDatasourceList" />
        <!-- <svg-icon icon-class="filter" class="datasource-search-filter" @click="showFilterDialog" /> -->
        <el-select v-model="projectId" size="mini" class="datasource-search-project">
          <el-option
            v-for="project of $store.getters.allProjects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </div>
      <div class="button-group">
        <el-button
          size="small"
          plain
          class="app-el-btn-primary"
          @click="addDataVisible = true"
        >新建
        </el-button>
        <el-button
          size="small"
          plain
          class="app-el-btn-primary"
        >复制
        </el-button>
        <el-button
          size="small"
          plain
          class="app-el-btn-primary"
        >删除
        </el-button>
      </div>
      <DatasourceList
        ref="datasourceList"
        class="datasource-main"
        table-height="calc(100vh - 19.2vw)"
        show-selection
        :append-params="appendParams"
        @editDatasource="editDatasource"
      />
      <el-dialog
        title="上传数据源"
        :visible="addDataVisible"
        width="40%"
        :before-close="handleCancel"
      >
        <el-form>
          <el-form-item label="数据源文件名" label-width="100px">
            <el-input v-model="addForm.fileName" />
          </el-form-item>
        </el-form>
        <FileUpload
          ref="uploadDatasource"
          v-model="addForm.datasourceFile"
          name="file_name"
          :action="`${baseUrl}/datasource/sources/`"
          :data="{ title: addForm.fileName, project: projectId }"
          :on-success="handleUploadSuccess"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleAddConfirm">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="上传数据源"
        :visible="editDataVisible"
        width="40%"
      >
        <el-form>
          <el-form-item label="数据源文件名" label-width="100px">
            <el-input v-model="editForm.fileName" />
          </el-form-item>
        </el-form>
        <FileUpload
          v-if="editForm.datasource"
          ref="uploadDatasource2"
          v-model="editForm.datasourceFile"
          name="file_name"
          :action="`${baseUrl}/datasource/sources/${editForm.datasource.id}/`"
          :http-request="uploadAction"
          :data="{ title: editForm.fileName }"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDataVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleEditConfirm">确 定</el-button>
        </span>
      </el-dialog>
      <FilterDialog v-if="false" :visible.sync="filterDialogVisible" />
    </div>
  </div>
</template>

<script>

import { Navbar } from '@/layout/components'
import DatasourceList from './datasourceList'
import FileUpload from '@/components/FileUpload'
import axios from 'axios'
import { deleteDatasource } from '@/api/datasource'
import { getToken } from '@/utils/auth'
import AppSearch from '@/components/AppSearch'
import FilterDialog from './datasourceList/filterDialog'

const baseUrl = process.env.VUE_APP_BASE_API

export default {
  name: 'Datasource',
  components: {
    DatasourceList,
    FileUpload,
    Navbar,
    AppSearch,
    FilterDialog
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
      form: {
        title: ''
      },
      baseUrl,
      projectId,
      addForm: {
        fileName: '',
        datasourceFile: []
      },
      editForm: {
        datasource: null,
        fileName: '',
        datasourceFile: []
      },
      addDataVisible: false,
      editDataVisible: false,
      filterDialogVisible: false
    }
  },
  computed: {
    appendParams() {
      return {
        project: this.projectId,
        title: this.form.title
      }
    }
  },
  watch: {
    projectId: {
      handler(value, oldval) {
        this.$store.dispatch('user/setSelectedProjectId', value)
        this.$nextTick(_ => {
          this.refreshDatasourceList()
        })
      }
    }
  },
  activated() {
    if (this.needsRefresh) {
      this.refreshDatasourceList()
      this.refreshSelectedProject()
    }
  },
  deactivated() {
    this.needsRefresh = true
  },
  methods: {
    showFilterDialog() {
      this.filterDialogVisible = true
    },
    handleUploadSuccess() {
      this.addDataVisible = false
      this.$message({
        type: 'success',
        message: '上传成功'
      })
      this.refreshDatasourceList()
    },
    handleCancel() {
      this.addDataVisible = false
    },
    handleAddConfirm() {
      if (!(this.addForm.fileName && this.projectId)) {
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
    handleEditConfirm() {
      if (!this.editForm.fileName) {
        return
      }
      if (!this.$refs.uploadDatasource2.fileList.length) {
        this.$message({
          message: '请上传文件',
          type: 'error'
        })
        return
      }
      this.$refs.uploadDatasource2.submit()
    },
    editDatasource(datasource) {
      this.editDataVisible = true
      this.editForm.datasource = datasource
      this.editForm.fileName = datasource.title
    },
    uploadAction(params) {
      const { data, action, file } = params
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }
      formData.append('file_name', file)

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          AUTHORIZATION: getToken()
        }
      }

      axios.put(action, formData, config).then(({ data }) => {
        if (data.code === 200) {
          this.editDataVisible = false
          this.$message({
            type: 'success',
            message: '上传成功'
          })
          this.refreshDatasourceList()
        } else {
          this.$message({
            type: 'error',
            message: data.message
          })
        }
      })
    },
    deleteDatasources() {
      const selection = this.$refs.datasourceList.getSelection()
      if (!(selection && selection.length)) {
        return
      }
      this.$confirm('将删除数据源, 是否继续?', '提示').then(_ => {
        const ids = selection.map(({ id }) => id)
        deleteDatasource({
          ids
        }).then(_ => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.refreshDatasourceList()
        })
      }).catch(_ => {})
    },
    refreshDatasourceList() {
      this.$refs.datasourceList.getDatasourceList()
    },
    refreshSelectedProject() {
      if (this.$store.getters.selectedProjectId) {
        this.projectId = this.$store.getters.selectedProjectId
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.datasource-container {
  min-height: calc(100vh - 70px);
  display: flex;
  flex-direction: column;
  position: absolute;
  top: $navBarHeight; bottom: 0; left: 0; right: 0;

  .datasource-search {
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
    &-project {
      float: right;
      >>> .el-input__inner {
        height: 50px;
        line-height: 50px;
      }
    }
  }
  .datasource-main {
    border: 10px solid #D9D9D7;
    padding: 20px 20px 0;
    flex-grow: 1;
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
}
</style>
