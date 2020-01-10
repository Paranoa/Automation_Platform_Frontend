<template>
  <ul class="key-value-table-container">
    <li v-for="(item, index) of keyValueList" :key="index">
      <el-row v-if="type==='file'">
        <el-col :span="4">
          <el-input :ref="`input-key-${index}`" v-model="item.key" size="mini" />
        </el-col>
        <el-col :span="3">
          <el-select v-model="item.valueType" size="mini">
            <el-option label="text" value="text" />
            <el-option label="file" value="file" />
          </el-select>
        </el-col>
        <el-col :span="15">
          <el-input v-show="!item.valueType || item.valueType === 'text'" :ref="`input-value-${index}`" v-model="item.textValue" size="mini" />
          <div v-show="item.valueType === 'file'">
            <FileUpload action="/" :ref="`upload-${index}`" v-model="item.files" />
          </div>
        </el-col>
        <el-col :span="2">
          <el-button
            type="danger"
            size="mini"
            class="button-delete"
            @click="keyValueList.length > 1 && keyValueList.splice(index, 1)"
          >删除
          </el-button>
        </el-col>
      </el-row>
      <el-row v-else>
        <el-col :span="4">
          <el-input :ref="`input-key-${index}`" v-model="item.key" size="mini" />
        </el-col>
        <el-col :span="8">
          <el-input :ref="`input-value-${index}`" v-model="item.value" size="mini" />
        </el-col>
        <el-col :span="10">
          <el-input :ref="`input-desc-${index}`" v-model="item.desc" size="mini" />
        </el-col>
        <el-col :span="2">
          <el-button
            type="danger"
            size="mini"
            class="button-delete"
            @click="keyValueList.length > 1 && keyValueList.splice(index, 1)"
          >删除
          </el-button>
        </el-col>
      </el-row>
    </li>
    <li class="table-item-add">
      <el-row>
        <el-col :span="4">
          <el-input size="mini" @click.native="addItem('key')" />
        </el-col>
        <el-col :span="8">
          <el-input size="mini" @click.native="addItem('value')" />
        </el-col>
        <el-col :span="10">
          <el-input size="mini" @click.native="addItem('desc')" />
        </el-col>
      </el-row>
    </li>
  </ul>
</template>

<script>
import FileUpload from '@/components/FileUpload'

export default {
  components: { FileUpload },
  props: {
    type: {
      type: String,
      default: ''
    },
    keyValueList: {
      type: Array,
      default() {
        return [{}]
      }
    }
  },
  methods: {
    addItem(focusType) {
      this.keyValueList.push({})
      this.focusLastItem(focusType)
    },
    focusLastItem(focusType) {
      // 等待dom更新后focus最后一行
      this.$nextTick(() => {
        const index = this.keyValueList.length - 1
        if (focusType === 'key') {
          this.$refs[`input-key-${index}`][0].focus()
        } else if (focusType === 'value') {
          this.$refs[`input-value-${index}`][0].focus()
        } else if (focusType === 'desc') {
          this.$refs[`input-value-${index}`][0].focus()
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .key-value-table-container {
    list-style: none;
    margin-top: 0;
    padding-left: 0;

    >li {
      margin-top: 1px;

      &.table-item-add /deep/ .el-input__inner {
        background: #ccc
      }

      .button-delete {
        margin-left: 1px;
        width: calc(100% - 1px);
      }
    }
  }
</style>
