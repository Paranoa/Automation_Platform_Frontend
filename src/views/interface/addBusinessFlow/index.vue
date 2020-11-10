<template>
  <div v-loading="isLoading" class="add-business-container">
    <div class="add-business-title">
      {{ isEdit ? '编辑流程' : '新建流程' }}
    </div>
    <div class="add-business-main">
      <el-form
        ref="addBusinessForm"
        label-width="100px"
        label-position="left"
        :model="form"
        :rules="businessRules"
      >
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="流程描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" resize="none" />
        </el-form-item>
      </el-form>
      <div class="add-business-title">
        <span class="title">步骤详情</span>
        <span>
          <span
            class="app-btn app-btn-green-hollow"
            @click="chooseInterface"
          >选择单接口
          </span>
          <span
            class="app-btn app-btn-green-hollow"
            @click="expandAll"
          >打开所有步骤
          </span>
        </span>
      </div>
      <Draggable
        v-show="selectedFlow.length"
        v-model="selectedFlow"
        class="list-group"
        tag="ul"
        v-bind="dragOptions"
        @start="drag = true"
        @end="drag = false"
      >
        <transition-group type="transition" :name="!drag ? 'flip-list' : null">
          <li
            v-for="(item, index) of selectedFlow"
            :key="item.id? item.id : index"
            class="list-group-item"
          >
            <div class="list-group-item-main">
              <span>步骤{{ index + 1 }}</span>
              <span><el-input v-model="item.name" /></span>
              <span>
                <span
                  class="app-link-blue"
                  @click="editOriginInterface(item.interface)"
                >修改原接口
                </span>
                <span
                  class="app-link-blue"
                  @click="editParams(item)"
                >修改参数
                </span>
                <span
                  class="app-link-blue"
                  @click="deleteFlow(item, index)"
                >删除
                </span>
                <span
                  class="icon-expand"
                  @click="toggleDetail(item)"
                >...
                </span>
              </span>
            </div>
            <div v-show="item.showDetai" v-if="item.interface" class="list-group-item-detail">
              <span>
                <label>名称：</label>
                <span>{{ item.interface.name }}</span>
              </span>
              <span>
                <label>路径：</label>
                <span>{{ item.interface.path_url }}</span>
              </span>
              <span>
                <label>端口：</label>
                <span>{{ item.interface.port }}</span>
              </span>
              <span>
                <label>描述：</label>
                <span>{{ item.interface.desc }}</span>
              </span>
              <span>
                <label>协议：</label>
                <span>{{ item.interface.request_protocol | httpProtocol }}</span>
              </span>
              <span>
                <label>请求方式：</label>
                <span>{{ item.interface.request_way | httpMethod }}</span>
              </span>
            </div>
          </li>
        </transition-group>
      </Draggable>
      <div v-show="!selectedFlow.length" class="list-group__empty">
        --- 请选择接口 ---
      </div>
      <span slot="footer" class="dialog-footer">
        <span
          class="app-btn app-btn-green"
          @click="handleExport"
        >导出数据源
        </span>
        <span
          class="app-btn app-btn-blue"
          @click="handleConfirm"
        >保 存
        </span>
        <span
          class="app-btn app-btn-white"
          @click="handleCancel"
        >返 回
        </span>
      </span>
    </div>
    <el-dialog
      title="选择单接口"
      :visible="interfaceVisible"
      width="80%"
      :before-close="_ => interfaceVisible = false"
    >
      <InterfaceList
        ref="interfaceList"
        table-height="20vw"
        :show-operation="false"
        table-class="app-list-table"
        show-selection
        show-search
        :append-params="{
          interface_type: 1
        }"
      />
      <span slot="footer" class="dialog-footer-inner">
        <span
          class="app-btn app-btn-blue"
          @click="handleConfirmChoose"
        >确 定
        </span>
        <span
          class="app-btn app-btn-white"
          @click="interfaceVisible = false"
        >取 消
        </span>
      </span>
    </el-dialog>
    <el-dialog
      title="修改接口参数"
      :visible="editParamsVisible"
      width="80%"
      :before-close="_ => editParamsVisible = false"
    >
      <EditInterfaceParams
        v-if="currFlow"
        is-edit-params
        :default-interface="currFlow.interface"
        @submit="handleEditParamsSubmit"
        @close="_ => editParamsVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import InterfaceList from '../interfaceList'
import EditInterfaceParams from '@/views/interface/addInterface'
import businessRules from '@/rules/businessRules'
import { addInterface, getAccessories, updateInterface, updateAccessories, deleteAccessories, getInterfaceInfo } from '@/api/interface'
import { filterProp } from '@/utils'

// 单步流程对象(flow)自身属性的字段
const FLOW_DATA_COLUMN = ['id', 'interface', 'flow', 'name', 'step']
// 单步流程对象(flow)中 接口可修改的Param字段
const PARAMS_DATA_COLUMN = ['params', 'headerparams', 'bodyparams', 'preprocessing', 'postprocessing', 'assertion', 'bodyformat', 'bodymessageformat', 'variable']

export default {
  components: {
    Draggable,
    InterfaceList,
    EditInterfaceParams
  },
  data() {
    return {
      form: {
        name: '',
        desc: ''
      },
      interfaceVisible: false,
      selectedFlow: [],
      drag: false,
      businessRules,
      isLoading: false,
      currFlow: null,
      editParamsVisible: false,
      toDeleteFlow: []
    }
  },
  computed: {
    isEdit() {
      return this.$route.name === 'BusinessEdit'
    },
    dragOptions() {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    },
    projectId() {
      return this.$route.params.projectId
    },
    moduleId() {
      if (this.isEdit) {
        return this.interface.intermodule
      } else {
        return this.$route.params.moduleId
      }
    },
    interface() {
      return this.$route.params.interface
    }
  },
  beforeRouteEnter(to, from, next) {
    if (to.name === 'BusinessEdit' && !to.params.interface) {
      getInterfaceInfo({
        id: to.params.interfaceId
      }).then(res => {
        to.params.interface = res.data
        next()
      })
    } else {
      next()
    }
  },
  mounted() {
    if (this.isEdit) {
      this.isLoading = true
      getAccessories({
        flow: this.interface.id
      }).then(res => {
        const { name, desc } = this.interface
        this.form = {
          name,
          desc
        }
        this.selectedFlow.push(...res.data.map(obj => {
          const flowObj = filterProp(obj, FLOW_DATA_COLUMN)
          const interfaceParamObj = filterProp(obj, PARAMS_DATA_COLUMN)
          const originParams = this.getOriginParams(interfaceParamObj)
          const form_data = obj.form_data || {}
          return {
            ...flowObj,
            name: obj.name,
            interface: {
              ...obj.interface_detail,
              ...interfaceParamObj,
              form_data
            },
            originParams
          }
        }))
      }).finally(_ => { this.isLoading = false })
    }
  },
  methods: {
    handleCancel() {
      this.$router.go(-1)
    },
    handleConfirm() {
      this.$refs.addBusinessForm.validate(valid => {
        if (!valid) {
          return
        }
        if (!this.selectedFlow.length) {
          this.$message({
            message: '请向流程中添加至少一个接口',
            type: 'error'
          })
          return
        }

        if (this.isEdit) {
          this.isLoading = true
          Promise.all([
            this.updateInterface(),
            this.updateAccessories(),
            this.deleteAccessories()
          ]).then(_ => {
            this.$message({
              message: '更新流程成功',
              type: 'success'
            })
            this.$router.go(-1)
          }).catch(e => {
            this.isLoading = false
            this.$message({
              message: e.message,
              type: 'error'
            })
          })
        } else {
          this.isLoading = true
          this.addInterface()
            .then(this.addAccessories)
            .then(_ => {
              this.$message({
                message: '新建流程成功',
                type: 'success'
              })
              this.$router.go(-1)
            })
            .catch(e => {
              this.$message({
                message: e.message,
                type: 'error'
              })
            })
            .finally(_ => {
              this.isLoading = false
            })
        }
      })
    },
    handleExport() {
    },
    getOriginParams(data) {
      const result = {}
      PARAMS_DATA_COLUMN.forEach(key => {
        result[key] = data[key]
      })
      return result
    },
    getDiffData(originData, formData) {
      // 只将有变化的数据提交
      const result = {}
      const isChange = (a, b) => JSON.stringify(a) !== JSON.stringify(b)
      Object.keys(originData).forEach(key => {
        // body为form-data时 diff特殊处理
        if (key === 'bodyparams' && formData.bodyformat === 1) {
          return
        } else if (isChange(formData[key], originData[key])) {
          result[key] = formData[key]
        }
      })
      console.log('diffing: ', originData, formData)
      console.log('diff Result: ', result)
      return result
    },
    editOriginInterface(interfaceObj) {
      this.$router.push({
        name: 'InterfaceEdit',
        params: {
          projectId: interfaceObj.project,
          interfaceId: interfaceObj.id
        }
      })
    },
    editParams(item) {
      this.currFlow = item
      this.editParamsVisible = true
    },
    handleEditParamsSubmit(formData) {
      const paramsData = this.filterParamsData(formData)
      console.log(paramsData)
      if (this.isEdit) {
        this.currFlow.paramsData = this.getDiffData(this.currFlow.originParams, paramsData)
      } else {
        this.currFlow.paramsData = paramsData
      }
      // 更新接口数据中的paramsData
      this.currFlow.interface = {
        ...this.currFlow.interface,
        ...paramsData
      }
      this.editParamsVisible = false
    },
    filterParamsData(data) {
      return filterProp(data, PARAMS_DATA_COLUMN)
    },
    toggleDetail(item) {
      this.$set(item, 'showDetai', !item.showDetai)
    },
    chooseInterface() {
      this.interfaceVisible = true
      if (this.$refs.interfaceList) {
        this.$refs.interfaceList.clearSelection()
      }
    },
    expandAll() {
      this.selectedFlow.forEach(item => {
        this.$set(item, 'showDetai', true)
      })
    },
    handleConfirmChoose() {
      const selection = this.$refs.interfaceList.getSelection()
      this.selectedFlow.push(...selection.map(obj => {
        return {
          showDetai: false,
          name: obj.name,
          interface: obj,
          paramsData: this.filterParamsData(obj)
        }
      }))
      this.interfaceVisible = false
    },
    addInterface() {
      const { name, desc } = this.form
      const formData = {
        name,
        desc,
        interface_type: 2,
        project: this.projectId,
        intermodule: this.moduleId
      }
      return addInterface(formData)
    },
    updateInterface() {
      const { name, desc } = this.form
      const formData = {
        name,
        desc,
        project: this.projectId,
        intermodule: this.moduleId
      }
      return updateInterface({
        id: this.interface.id
      }, formData)
    },
    addAccessories(res) {
      const flow = res.data.id
      const formData = this.selectedFlow.map((obj, index) => ({
        flow,
        interface: obj.interface.id,
        name: obj.name,
        step: index,
        ...obj.paramsData
      }))
      return updateAccessories(formData)
    },
    updateAccessories() {
      const formData = this.selectedFlow.map((obj, index) => ({
        flow: this.interface.id,
        id: obj.id,
        interface: obj.interface.id,
        name: obj.name,
        step: index,
        ...obj.paramsData
      }))
      return updateAccessories(formData)
    },
    deleteAccessories() {
      if (this.toDeleteFlow.length) {
        return deleteAccessories({
          ids: this.toDeleteFlow.map(({ id }) => id)
        })
      } else {
        return Promise.resolve()
      }
    },
    deleteFlow(item, index) {
      this.$confirm('确认删除?').then(_ => {
        this.selectedFlow.splice(index, 1)
        this.toDeleteFlow.push(item)
      }).catch(_ => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.add-business-container {
  min-height: 100vh;
  padding: 0 30px 90px;

  .add-business-title {
    font-size: 20px;
    line-height: 28px;
    padding: 20px 0;
  }

  .add-business-main {
    .add-business-title {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        font-size: 20px;
      }
    }
  }

  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }

  .list-group {
    max-height: calc(100vh - 390px);
    overflow: auto;
    margin: 20px 0;
    list-style: none;
    padding-left: 0;
    border: 1px solid #D9D9D7;
  }
  .list-group__empty {
    margin: 20px 0;
    border: 1px solid #D9D9D7;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
  .list-group-item {
    cursor: move;
    border-radius: 5px;
    .list-group-item-main {
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      >span {
        &:first-of-type, &:last-of-type {
          display: inline-block;
          box-sizing: border-box;
        }
        &:first-of-type {
          width: 200px;
          padding-left: 100px;
        }
        &:last-of-type {
          width: 400px;
          padding-right: 60px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .app-link-blue {
            margin-right: 20px;
          }
          .icon-expand {
            margin-left: 20px;
          }
        }
      }
    }
    .list-group-item-detail {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 10px 50px;
      border-top: 1px dashed #D9D9D7;
      background: rgba(239,243,246, .6);
      >span {
        width: 33.3%;
        height: 50px;
        line-height: 20px;
        padding: 15px 0;
      }
    }

    &:not(:last-of-type) {
      border-bottom: 1px dashed #D9D9D7;
    }
  }
  .dialog-footer {
    position: absolute;
    bottom: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .dialog-footer-inner {
    display: flex;
    justify-content: center;
  }
  .icon-expand {
    display: inline-block;
    width: 30px;
    height: 30px;
    margin: 0 10px;
    background: #259788;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 17px;
    font-weight: bold;
    font-size: 23px;
    cursor: pointer;
  }
}
</style>
