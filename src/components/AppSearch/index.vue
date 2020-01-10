<template>
  <div class="app-search-input">
    <el-input
      size="small"
      clearable
      placeholder="请输入内容"
      class="input-with-select"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <el-button slot="prepend" icon="el-icon-search" />
    </el-input>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style>
  .app-search-input {
    display: inline-block
  }
</style>
