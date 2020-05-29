<template>
  <el-dialog
    title="筛选条件"
    :visible="visible"
    width="20%"
    append-to-body
    :before-close="handleCancel"
  >
    <el-form label-width="80px" :model="form">
      <el-form-item label="类型">
        <el-select v-model="form.interface_type" :disabled="isStaticData('interface_type')">
          <el-option label="全部" value="" />
          <el-option label="接口" :value="1" />
          <el-option label="流程" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="运行状态" :disabled="isStaticData('status')">
        <el-select v-model="form.status">
          <el-option label="全部" value="" />
          <el-option label="未运行" :value="1" />
          <el-option label="运行中" :value="2" />
          <el-option label="运行完成" :value="3" />
        </el-select>
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
    },
    staticData: {
      // 该属性作为固有属性, 将带入默认值并不可修改（若有）
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      form: {
        interface_type: '',
        status: ''
      }
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
    },
    staticData: {
      handler(val) {
        for (const key in val) {
          this.form[key] = val[key]
        }
      },
      immediate: true
    }
  },
  methods: {
    isStaticData(key) {
      return key in this.staticData
    },
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
