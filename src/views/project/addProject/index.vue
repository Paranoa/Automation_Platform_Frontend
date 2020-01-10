<template>
  <el-dialog
    class="add-interface-container"
    :title="isEdit? '编辑项目' : '新建项目'"
    :visible="visible"
    width="80%"
    :before-close="handleCancel"
  >
    <el-form
      label-width="100px"
      :model="form"
      :rules="projectFormRules"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="form.name" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开始时间" prop="start_time">
            <el-date-picker v-model="form.start_time" size="small" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结束时间" prop="end_time">
            <el-date-picker v-model="form.end_time" size="small" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="项目优先级" prop="level">
            <el-select v-model="form.level" size="small" style="width: 100%">
              <el-option label="高" :value="3" />
              <el-option label="中" :value="2" />
              <el-option label="低" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="负责人" prop="person_charge" size="small" filterable>
            <el-select v-model="form.person_charge" size="small" style="width: 100%">
              <el-option v-for="user of allUsers" :key="user.id" :label="user.name" :value="user.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="项目描述" prop="desc" size="small">
        <el-input v-model="form.desc" type="textarea" resize="none" :rows="3" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import projectFormRules from '@/rules/projectFormRules'
import { addProject, updateProject } from '@/api/project'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    project: {
      type: Object
    }
  },
  data() {
    return {
      projectFormRules,
      allUsers: this.$store.getters.allUsers,
      form: {
      }
    }
  },
  computed: {
    isEdit() {
      return this.project && this.project.id
    }
  },
  watch: {
    visible: {
      handler(value) {
        // 在每次窗口被打开时 重新以project数据初始化form
        if (value && this.project && Object.keys(this.project).length) {
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
      immediate: true
    }
  },
  methods: {
    handleCancel() {
      this.project
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      const formData = {
        ...this.form,
        start_time: this.form.start_time.getTime().toString(),
        end_time: this.form.end_time.getTime().toString()
      }
      if (this.isEdit) {
        const diffData = this.getDiffData(formData)
        if (diffData) {
          updateProject({
            ...diffData,
            id: this.project.id
          }).then(res => {
            this.$message({
              type: 'success',
              message: '更新成功'
            });
            this.$emit('finished')
          })
        }
      } else {
        addProject(formData).then(res => {
          this.$message({
            type: 'success',
            message: '新建项目成功'
          });
          this.$emit('finished')
        })
      }

      this.$emit('update:visible', false)
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
  .add-interface-container {
    .body-radio-line {
      margin-bottom: 15px;
    }
  }
</style>
