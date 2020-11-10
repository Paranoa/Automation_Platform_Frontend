<template>
  <div class="add-project-container">
    <div class="add-project-title">
      {{ isEdit ? '编辑项目' : '新建项目' }}
    </div>
    <el-form
      ref="projectForm"
      :model="form"
      :rules="projectFormRules"
      label-position="left"
      :inline="true"
      hide-required-asterisk
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" size="small" />
      </el-form-item>
      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker v-model="form.start_time" size="small" />
      </el-form-item>
      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker v-model="form.end_time" size="small" />
      </el-form-item>
      <el-form-item label="项目优先级" prop="level">
        <el-select v-model="form.level" size="small" style="width: 100%">
          <el-option label="高" :value="3" />
          <el-option label="中" :value="2" />
          <el-option label="低" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="person_charge" size="small" filterable>
        <el-select v-model="form.person_charge" size="small" style="width: 100%">
          <el-option v-for="user of allUsers" :key="user.id" :label="user.username" :value="user.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目描述" prop="desc" size="small" class="form-block-item">
        <el-input v-model="form.desc" type="textarea" resize="none" :rows="3" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <div v-loading="isSubmiting" class="app-btn app-btn-blue" type="primary" @click="handleConfirm">保 存</div>
      <div class="app-btn app-btn-white" @click="handleCancel">返 回</div>
    </span>
  </div>
</template>

<script>
import projectFormRules from '@/rules/projectFormRules'
import { addProject, updateProject } from '@/api/project'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      projectFormRules: projectFormRules(this),
      allUsers: this.$store.getters.allUsers,
      form: {
      },
      isSubmiting: false
    }
  },
  computed: {
    project() {
      return this.$route.params.project
    },
    isEdit() {
      return this.$route.name === 'projectEdit'
    }
  },
  created() {
    if (this.isEdit) {
      const { name, level, person_charge, desc, start_time, end_time } = this.project
      this.originFormData = {
        name,
        level,
        person_charge,
        desc,
        start_time,
        end_time
      }

      this.form = {
        ...this.originFormData,
        start_time: new Date(+this.project.start_time),
        end_time: new Date(+this.project.end_time)
      }
    }
  },
  methods: {
    handleCancel() {
      this.$router.go(-1)
    },
    handleConfirm() {
      if (this.isSubmiting) return
      this.$refs.projectForm.validate(valid => {
        if (!valid) {
          return
        }

        const formData = {
          ...this.form,
          start_time: this.form.start_time.getTime().toString(),
          end_time: this.form.end_time.getTime().toString()
        }
        if (this.isEdit) {
          const diffData = this.getDiffData(formData)
          this.isSubmiting = true
          updateProject({
            ...diffData,
            id: this.project.id
          }).then(res => {
            this.$message({
              type: 'success',
              message: '更新成功'
            })
            this.$router.go(-1)
          }).finally(_ => {
            this.isSubmiting = false
          })
        } else {
          this.isSubmiting = true
          addProject(formData).then(res => {
            this.$message({
              type: 'success',
              message: '新建项目成功'
            })
            this.$router.go(-1)
            this.$store.dispatch('user/getAllProjects')
          }).finally(_ => {
            this.isSubmiting = false
          })
        }
      })
    },
    getDiffData(formData) {
      // 只将有变化的数据提交
      const result = {}
      for (const key in this.originFormData) {
        if (formData[key] !== this.originFormData[key]) {
          result[key] = formData[key]
        }
      }
      if (Object.keys(result)) {
        return result
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-project-container {
    min-height: 100vh;
    padding: 0 30px 90px;
    .add-project-title {
      font-size: 20px;
      line-height: 28px;
      padding: 20px 0;
    }
    >>> .el-form-item {
      margin-right: 30px;
    }
    .form-block-item {
      display: block;
      >>> label {
        float: left;
      }
      >>> .el-form-item__content {
        display: block;
        margin-left: 68px;
      }
    }
    .dialog-footer {
      position: absolute;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .body-radio-line {
      margin-bottom: 15px;
    }
  }
</style>
