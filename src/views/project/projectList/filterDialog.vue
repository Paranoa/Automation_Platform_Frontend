<template>
  <el-dialog
    title="筛选条件"
    :visible="visible"
    width="400px"
    append-to-body
    :before-close="handleCancel"
  >
    <el-form label-width="120px" :model="form">
      <el-form-item label="项目优先级">
        <el-select v-model="form.level">
          <el-option label="全部" :value="''" />
          <el-option label="高" :value="3" />
          <el-option label="中" :value="2" />
          <el-option label="低" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目状态">
        <el-select v-model="form.status">
          <el-option label="全部" :value="''" />
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <span class="app-btn app-btn-blue" type="primary" @click="handleConfirm">确 定</span>
      <span class="app-btn app-btn-white" @click="handleCancel">返 回</span>
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
      form: { level: null, status: null }
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

<style scoped lang="scss">
  .dialog-footer {
    display: flex;
    justify-content: center;
  }
</style>
