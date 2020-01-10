<template>
  <el-dialog
    title="筛选条件"
    :visible="visible"
    width="40%"
    append-to-body
    :before-close="handleCancel"
  >
    <el-form label-width="80px" :model="form">
      <el-form-item label="名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="活动区域">
        <el-input v-model="form.region" />
      </el-form-item>
      <el-form-item label="活动形式">
        <el-input v-model="form.type" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    defaultData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {}
    }
  },
  watch: {
    defaultData: {
      handler(val) {
        for (const key in val) {
          this.form[key] = val[key]
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
      this.$emit('selected', this.form)
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style>

</style>
