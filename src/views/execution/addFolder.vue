<template>
  <el-dialog
    :title="isEdit ? '修改文件夹' : '新建文件夹'"
    :visible="visible"
    width="40%"
    :before-close="handleCancel"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="文件夹名">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { addExecutionSet, updateExecutionSet } from '@/api/execution'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    parent: {
      type: Object,
      default: null
    },
    folder: {
      type: Object,
      default() {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [String, Number],
      default: ''
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
    parentId() {
      if (this.parent) {
        return this.parent.id === '_default' ? '' : this.parent.id
      } else {
        return ''
      }
    }
  },
  watch: {
    visible: {
      handler(value) {
        if (value) {
          if (this.isEdit && this.folder && this.folder.name) {
            this.form.name = this.folder.name
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
        updateExecutionSet({
          id: this.folder.id
        }, {
          name: this.form.name
        }).then(res => {
          this.$message({
            type: 'success',
            message: '更新完成'
          })
          this.$emit('finished', res.data)
          this.$emit('update:visible', false)
        })
      } else {
        addExecutionSet({
          name: this.form.name,
          type: 1,
          parent: this.parentId,
          project: this.projectId
        }).then(res => {
          this.$message({
            type: 'success',
            message: '新建文件夹成功'
          })
          this.$emit('finished', res.data)
          this.$emit('update:visible', false)
        })
      }
    }
  }
}
</script>
