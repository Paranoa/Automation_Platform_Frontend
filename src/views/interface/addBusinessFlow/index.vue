<template>
  <div class="add-business-container">
    <el-dialog
      title="新建业务流"
      :visible="visible"
      width="80%"
      :before-close="handleClose"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="用例名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="用例描述" prop="description">
          <el-input v-model="form.description" type="textarea" resize="none" />
        </el-form-item>
        <el-row>
          <el-col :span="6">
            <el-form-item label="业务线">
              <el-select v-model="form">
                <el-option value="测试示例" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="模块">
              <el-select v-model="form">
                <el-option value="普通用法" />
              </el-select>
            </el-form-item></el-col>
          <el-col :span="6">
            <el-form-item label="来源">
              <el-select v-model="form">
                <el-option value="WEB" />
              </el-select>
            </el-form-item></el-col>
          <el-col :span="6">
            <el-form-item label="优先级">
              <el-select v-model="form">
                <el-option value="中" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="chooseInterface">选择单接口</el-button>
        </el-form-item>
      </el-form>
      <Draggable
        v-model="selectedInterface"
        class="list-group"
        tag="ul"
        v-bind="dragOptions"
        @start="drag = true"
        @end="drag = false"
      >
        <transition-group type="transition" :name="!drag ? 'flip-list' : null">
          <li
            v-for="(item, index) of selectedInterface"
            :key="item.id"
            class="list-group-item"
          >
            <el-alert :title="item.display_time" type="success" @close="selectedInterface.splice(index, 1)" />
          </li>
        </transition-group>
      </Draggable>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="选择单接口"
      :visible="interfaceVisible"
      append-to-body
      width="80%"
    >
      <InterfaceList
        ref="interfaceList"
        table-height="calc(100vh - 300px)"
        :show-operation="false"
        show-selection
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="interfaceVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirmChoose">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import InterfaceList from '../interfaceList'
export default {
  components: {
    Draggable,
    InterfaceList
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
      },
      interfaceVisible: false,
      selectedInterface: [],
      drag: false
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.$emit('update:visible', false)
        })
        .catch(_ => {})
    },
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      this.$emit('update:visible', false)
    },
    chooseInterface() {
      this.interfaceVisible = true
    },
    handleConfirmChoose() {
      const selection = this.$refs.interfaceList.getSelection()
      this.selectedInterface = selection
      this.interfaceVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
  list-style: none;
}
.list-group-item {
  cursor: move;
  border: 1px solid #ccc;
  margin-top: 5px;
  border-radius: 5px;
}
.list-group-item i {
  cursor: pointer;
}
</style>
