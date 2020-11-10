<template>
  <el-upload
    ref="upload"
    v-bind="$attrs"
    :class="{ 'upload-single': !multiple }"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
    :on-change="onChange"
    :auto-upload="autoUpload"
    :file-list="fileList"
    :headers="headers"
    :multiple="multiple"
  >
    <el-button size="mini" type="primary">点击上传</el-button>
  </el-upload>
</template>

<script>

import { getToken } from '@/utils/auth'
export default {
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    autoUpload: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fileList: [],
      headers: {
        AUTHORIZATION: getToken()
      }
    }
  },
  watch: {
    value: {
      handler(value) {
        this.fileList = value
      },
      immediate: true
    }
  },
  methods: {
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handlePreview(file) {
    },
    beforeUpload() {
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    onChange(file, fileList) {
      // 限制上传一个文件 上传第二个时覆盖
      if (!this.multiple && fileList.length >= 2) {
        fileList.splice(0, 1)
      }
      this.$emit('input', fileList)
      this.fileList = fileList
    },
    submit() {
      this.$refs.upload.submit()
    }
  }
}
</script>

<style lang="scss" scoped>
.upload-single {
  /deep/ .el-list-enter-active,
  /deep/ .el-list-leave-active {
    transition: none;
  }
}
</style>
