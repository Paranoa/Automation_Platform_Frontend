<template>
  <div class="http-table-container">
    <template v-if="type==='file'">
      <el-row class="table-head">
        <el-col :span="6">Key</el-col>
        <el-col :span="18">变量名</el-col>
      </el-row>
      <keyValueTable
        type="file"
        v-bind="$attrs"
      />
    </template>
    <template v-else>
      <el-row class="table-head">
        <el-col :span="4">Key</el-col>
        <el-col :span="8">变量名</el-col>
        <el-col :span="12">
          变量描述
          <el-button
            v-if="type==='query'"
            type="primary"
            size="mini"
            class="btn-params-switch"
            @click="switchParamsDisplay"
          >{{ isShowParamsString? 'key-value' : '原始' }}</el-button>
        </el-col>
      </el-row>
      <el-input
        v-if="type==='query'"
        v-show="isShowParamsString"
        v-model="paramsString"
        type="textarea"
      />
      <keyValueTable
        v-show="type==='keyValue' || !isShowParamsString"
        v-bind="$attrs"
      />
    </template>
  </div>
</template>

<script>
import KeyValueTable from './KeyValueTable'

export default {
  components: { KeyValueTable },
  props: {
    type: {
      validator: function(value) {
        return ['query', 'keyValue', 'file'].indexOf(value) !== -1
      },
      default: 'query'
    }
  },
  data() {
    return {
      isShowParamsString: false,
      paramsString: ''
    }
  },
  computed: {
    descMap() {
      const result = {}
      for (const item of this.keyValueList) {
        if (item.key && item.desc) {
          result[item.key] = item.desc
        }
      }
      return result
    }
  },
  methods: {
    switchParamsDisplay() {
      // 不做paramsString和keyValueList的双向绑定,而是按钮切换更新
      if (this.isShowParamsString) {
        const getParamListFromString = (str) => str.split('&').map(s => {
          const [key, value] = s.split('=')
          return {
            key,
            value,
            desc: this.descMap[key]
          }
        })
        this.isShowParamsString = false
        this.$emit('update:keyValueList', getParamListFromString(this.paramsString))
      } else {
        const getQueryString = (list) => {
          let str = ''
          list.forEach(({ key, value }) => {
            if (key && value) {
              str += `&${key}=${value}`
            }
          })
          return str.substring(1)
        }

        this.isShowParamsString = true
        this.paramsString = getQueryString(this.keyValueList)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.http-table-container {
  .table-head {
    background: #eff0ef;
    color: #000;
    font-weight: bold;
    line-height: 35px;
    text-align: center;
    border-bottom: 1px solid #a1a3a5;

    .btn-params-switch {
      float: right;
      margin-top: 3px;
    }
  }
}
</style>
