<template>
  <el-dialog
    :title="isEdit ? '修改模块' : '添加模块'"
    :visible="visible"
    width="40%"
    :before-close="handleCancel">
    <el-form :model="form" label-width="100px">
      <el-form-item label="模块名称">
        <el-input v-model="form.name"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addModule, updateModule } from '@/api/interface' 
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      required: true
    },
    module: {
      type: Object
    }
  },
  data() {
    return {
      form: {
        name: ''
      }
    }
  },
  computed: {
    isEdit() {
      return this.module && this.module.id
    }
  },
  watch: {
    visible: {
      handler(value) {
        if (value) {
          if (this.module && this.module.name) {
            this.form.name = this.module.name
          } else {
            this.form = {}
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      if (this.isEdit) {
        updateModule({
          id: this.module.id
        }, {
          name: this.form.name,
          project: this.projectId
        }).then(_ => {
          this.$message({
            type: 'success',
            message: '修改模块成功'
          })
          this.$emit('finished')
          this.$emit('update:visible', false)
        })
      } else {
        addModule({
          name: this.form.name,
          project: this.projectId
        }).then(_ => {
          this.$message({
            type: 'success',
            message: '新建模块成功'
          })
          this.$emit('finished')
          this.$emit('update:visible', false)
        })
      }
    }
  }
}
</script>

<style>

</style>