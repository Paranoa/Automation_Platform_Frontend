<template>
  <div class="datasource-container">
    <DatasourceList table-height="calc(100vh - 200px)" show-selection
      ref="datasourceList"
      :appendParams="appendParams"
      @editDatasource="editDatasource">
      <template slot="tableHead">
        <el-select size="mini" v-model="projectId" style="margin-top: 5px">
          <el-option v-for="project of $store.getters.allProjects"
            :key="project.id" :label="project.name" :value="project.id" />
        </el-select>
        <el-button size="small" plain @click="addDataVisible = true">新建</el-button>
        <el-button size="small" plain>复制</el-button>
        <el-button size="small" plain
          @click="deleteDatasources">删除</el-button>
      </template>
    </DatasourceList>
    <el-dialog
      title="title"
      :visible="addDataVisible"
      width="40%"
      :before-close="handleCancel">
      <el-form>
        <el-form-item label="数据源文件名" label-width="100px">
          <el-input v-model="addForm.fileName" />
        </el-form-item>
      </el-form>
      <FileUpload ref="uploadDatasource" v-model="addForm.datasourceFile"
        name="file_name"
        :action="`${baseUrl}/datasource/sources/`"
        :data="{ title: addForm.fileName, project: projectId }"
        :on-success="handleUploadSuccess"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleAddConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="title"
      :visible="editDataVisible"
      width="40%">
      <el-form>
        <el-form-item label="数据源文件名" label-width="100px">
          <el-input v-model="editForm.fileName" />
        </el-form-item>
      </el-form>
      <FileUpload ref="uploadDatasource2" v-model="editForm.datasourceFile"
        name="file_name"
        v-if="editForm.datasource"
        :action="`${baseUrl}/datasource/sources/${editForm.datasource.id}/`"
        :http-request="uploadAction"
        :data="{ title: editForm.fileName }"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDataVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

import DatasourceList from './datasourceList'
import FileUpload from '@/components/FileUpload';
import axios from 'axios'
import { deleteDatasource } from '@/api/datasource'

const baseUrl = process.env.VUE_APP_BASE_API

export default {
  name: 'Datasource',
  components: {
    DatasourceList,
    FileUpload
  },
  data() {
    return {
      form: {
        query: ''
      },
      baseUrl,
      projectId: '',
      addForm: {
        fileName: '',
        datasourceFile: [],
      },
      editForm: {
        datasource: null,
        fileName: '',
        datasourceFile: [],
      },
      addDataVisible: false,
      editDataVisible: false
    }
  },
  computed: {
    appendParams() {
      return this.projectId? { project: this.projectId } : {}
    }
  },
  methods: {
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
      this.$refs.uploadDatasource.submit()
    },
    handleEditConfirm() {
      if (!this.editForm.fileName) {
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
          'Content-Type': 'multipart/form-data'
        }
      }

      axios.put(action, formData, config).then(_ => {
        this.editDataVisible = false
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        this.refreshDatasourceList()
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
      })
    },
    refreshDatasourceList() {
      this.$refs.datasourceList.getDatasourceList()
    }
  }
}
</script>

<style lang="scss" scoped>

.datasource-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  padding: 10px;
}
</style>
