<template>
  <ul class="key-value-table-container">
    <li v-for="(item, index) of keyValueList" :key="index">
      <el-row v-if="type==='file'" v-loading="item.loading">
        <el-col :span="4">
          <el-input :ref="`input-key-${index}`" v-model="item.key" size="mini" />
        </el-col>
        <el-col :span="3">
          <el-select v-model="item.valueType" size="mini">
            <el-option label="text" value="text" />
            <el-option label="file" value="file" />
          </el-select>
        </el-col>
        <el-col :span="17" class="col-padding">
          <el-input v-show="!item.valueType || item.valueType === 'text'" :ref="`input-value-${index}`" v-model="item.value" size="mini" />
          <div v-show="item.valueType === 'file'">
            <FileUpload :ref="`upload-${index}`" v-model="item.files" action="/" />
          </div>
          <span
            class="button-delete"
            @click="handleDelete(index)"
          >x
          </span>
        </el-col>
      </el-row>
      <el-row v-else v-loading="item.loading">
        <el-col :span="4">
          <el-input :ref="`input-key-${index}`" v-model="item.key" size="mini" />
        </el-col>
        <el-col :span="8">
          <el-input :ref="`input-value-${index}`" v-model="item.value" size="mini" />
        </el-col>
        <el-col :span="12" class="col-padding">
          <el-input :ref="`input-desc-${index}`" v-model="item.desc" size="mini" />
          <span
            class="button-delete"
            @click="handleDelete(index)"
          >x
          </span>
        </el-col>
      </el-row>
    </li>
    <li class="table-item-add">
      <el-row v-if="type==='file'">
        <el-col :span="4">
          <el-input size="mini" @click.native="addItem('key')" />
        </el-col>
        <el-col :span="3">
          <el-input size="mini" @click.native="addItem('key')" />
        </el-col>
        <el-col :span="17">
          <el-input size="mini" @click.native="addItem('desc')" />
        </el-col>
      </el-row>
      <el-row v-else>
        <el-col :span="4">
          <el-input size="mini" @click.native="addItem('key')" />
        </el-col>
        <el-col :span="8">
          <el-input size="mini" @click.native="addItem('value')" />
        </el-col>
        <el-col :span="12">
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
      validator: function(value) {
        return ['text', 'file'].indexOf(value) !== -1
      },
      default: 'text'
    },
    keyValueList: {
      type: Array,
      default() {
        return [{}]
      }
    },
    onDelete: {
      type: Function,
      default: () => {}
    }
  },
  methods: {
    addItem(focusType) {
      this.keyValueList.push({})
      this.focusLastItem(focusType)
    },
    handleDelete(index) {
      const item = this.keyValueList[index]
      const handler = this.onDelete(item, this.keyValueList, index)
      if (handler instanceof Promise) {
        handler.then(_ => {
          this.keyValueList.splice(index, 1)
        }).catch(_ => {})
      } else if (handler !== false) {
        this.keyValueList.splice(index, 1)
      }
    },
    focusLastItem(focusType) {
      // 等待dom更新后focus最后一行
      this.$nextTick(() => {
        const index = this.keyValueList.length - 1
        this.$refs[`input-${focusType}-${index}`][0].focus()
      })
    }
  }
}
</script>

<style lang="scss">
  .key-value-table-container {
    padding: 1px;
    list-style: none;
    margin-top: 0;
    margin-bottom: 0;

    >li {
      &:not(:first-of-type) {
        margin-top: 1px;
      }
      &.table-item-add .el-input__inner {
        background: #eee;
        border: none;
      }
      &:hover:not(.table-item-add) {
        // outline: 1px solid #218FD9;
        background: rgba(204,238,236,0.25);

        .col-padding .button-delete {
          display: inline-block;
        }
      }

      &:last-of-type .el-row {
        border-bottom: none;
      }

      .el-input--mini .el-input__inner {
        height: 30px;
        line-height: 30px;
        border: none;
        background: #f5f6f5;
        border: 1px solid #a1a3a5;;
      }

      .col-padding {
        position: relative;
        .button-delete {
          display: none;
          position: absolute;
          top: 2px;
          right: -25px;
          transition: all .3s;
          color: #218FD9;
          font-size: 25px;
          cursor: pointer;
        }
      }

      .el-row {
        padding-right: 40px;
        border-bottom: 1px solid #a1a3a5;
        transition: all .1s;
      }

      .el-col {
        padding: 5px 0 5px 10px;
      }
    }
  }
</style>
