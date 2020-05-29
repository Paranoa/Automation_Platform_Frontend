<template>
  <div class="app-search-input">
    <i class="el-icon-search" />
    <el-input
      placeholder="请输入内容"
      class="input-with-select"
      v-bind="$attrs"
      v-on="$listeners"
    />
    <div class="button-query" @click="query">查询</div>
  </div>
</template>

<script>
export default {
  name: 'AppSearch',
  methods: {
    query() {
      this.$emit('query')
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-search-input {
    position: relative;
    display: inline-block;
    .el-icon-search {
      color: gray;
      font-size: 20px;
      position: absolute;
      z-index: 1;
      top: 14px;
      left: 15px;
    }
    >>> .el-input__inner {
      padding-left: 50px;
      padding-right: 120px;
      height: 50px;
      font-size: 16px;
    }
    .button-query {
      position: absolute;
      background: #0471AC;
      color: #fff;
      width: 120px;
      height: 100%;
      top: 0;
      right: 0;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      cursor: pointer;
      transition: all .3s;

      &:hover {
        background: #0090DA;
      }
    }
  }
</style>
