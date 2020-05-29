<template>
  <div
    v-loading="loading"
    class="add-interface-container auto-height"
  >
    <div v-if="!isEditParams" class="add-interface-title">
      {{ isEdit? '编辑接口' : '新建接口' }}
    </div>
    <el-form
      ref="interfaceForm"
      :model="form"
      :rules="interfaceFormRules"
      label-position="left"
      hide-required-asterisk
      :inline="true"
    >
      <el-form-item label="接口名称" prop="name" class="form-block-item">
        <el-input v-model="form.name" :disabled="isEditParams" />
      </el-form-item>
      <el-form-item label="接口描述" prop="desc" class="form-block-item">
        <el-input v-model="form.desc" type="textarea" resize="none" :disabled="isEditParams" />
      </el-form-item>
      <el-form-item label="请求协议" prop="request_protocol" label-width="4.1667vw" class="label-protocol">
        <el-select v-model="form.request_protocol" :disabled="isEditParams">
          <el-option v-for="option of optionsProtocol" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务器名 or IP" prop="template_server">
        <el-select v-model="form.template_server" :disabled="isEditParams">
          <el-option v-for="server of serverList" :key="server.id" :label="server.name" :value="server.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="端口" prop="template_port">
        <el-select v-model="form.template_port" :disabled="isEditParams">
          <el-option v-for="server of serverList" :key="server.id" :label="server.name" :value="server.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求方式" prop="request_way">
        <el-select v-model="form.request_way" placeholder="HttpMethod" :disabled="isEditParams">
          <el-option v-for="option of optionsHttpMethod" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="路径" prop="path_url">
        <el-input v-model="form.path_url" placeholder="url" :disabled="isEditParams" />
      </el-form-item>
      <el-tabs v-model="activeTab" class="param-tabs" type="border-card">
        <el-tab-pane label="PARAMS" name="params">
          <HttpKeyValueTable type="query" :key-value-list.sync="paramsList" />
        </el-tab-pane>
        <el-tab-pane label="HEADER" name="header">
          <HttpKeyValueTable type="keyValue" :key-value-list="headerList" />
        </el-tab-pane>
        <el-tab-pane label="BODY" name="body">
          <div class="body-radio-line clearfix">
            <el-radio v-for="option of optionsBodyType" :key="option.value" v-model="form.bodyformat" :label="option.value">{{ option.label }}</el-radio>
            <el-select
              v-if="form.bodyformat === 3"
              v-model="form.bodymessageformat"
              placeholder="HttpMethod"
              size="mini"
              style="float: right"
            >
              <el-option v-for="option of optionsBodyRayType" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </div>
          <div v-show="form.bodyformat === 1">
            <HttpKeyValueTable type="file" :key-value-list="bodyFormList" />
          </div>
          <div v-show="form.bodyformat === 2">
            <HttpKeyValueTable type="query" :key-value-list="bodyAppList" />
          </div>
          <div v-show="form.bodyformat === 3" class="body-type-box">
            <div
              v-show="form.bodymessageformat === 3"
              class="left hover-primary"
              @click="toggleTreeView"
            >
              {{ isShowTreeView ? 'Original' : 'Tree View' }}
            </div>
            <div class="right">
              <div v-show="isShowTreeView && form.bodymessageformat === 3">
                <JsonTree :data="bodyRawJsonObject" />
              </div>
              <div>
                <codeEditor v-if="plainEditorInited" v-show="form.bodymessageformat === 1" ref="CodeEditor1" v-model="form.bodyRawTextPlain" mode="" />
                <codeEditor v-if="jSEditorInited" v-show="form.bodymessageformat === 2" ref="CodeEditor2" v-model="form.bodyRawTextJS" mode="javascript" />
                <codeEditor v-if="jsonEditorInited" v-show="form.bodymessageformat === 3 && !isShowTreeView" ref="CodeEditor3" v-model="bodyRawJsonObject" mode="application/json" />
                <codeEditor v-if="htmlEditorInited" v-show="form.bodymessageformat === 4" ref="CodeEditor4" v-model="form.bodyRawTextHTML" mode="htmlmixed" />
                <codeEditor v-if="xmlEditorInited" v-show="form.bodymessageformat === 5" ref="CodeEditor5" v-model="form.bodyRawTextXML" mode="xml" />
              </div>
            </div>
          </div>
          <div v-show="form.bodyformat === '4'">
            <FileUpload v-model="bodyBinaryFile" action="/" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="前置处理" name="prependScript">
          <div class="code-editor-container">
            <div class="left">
              <div class="code-error-msg">{{ prependScriptError || '&nbsp;' }}</div>
              <codeEditor v-if="prependEditorInited" ref="CodeEditor6" v-model="prependScript" mode="python" />
            </div>
            <div class="right">
              <div class="title">关键字</div>
              <div class="key-words-wrapper">
                <el-popover
                  v-for="item of allKeyWords"
                  :key="`keywords_${item.id}`"
                  placement="left"
                  title="提示"
                  width="200"
                  trigger="hover"
                  :content="item.desc"
                >
                  <div
                    slot="reference"
                    class="item"
                    @click="insertKeyWord(item)"
                  >
                    {{ item.name }}
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="后置处理" name="appendScript">
          <div class="code-editor-container">
            <div class="left">
              <div class="code-error-msg">{{ appendScriptError || '&nbsp;' }}</div>
              <codeEditor v-if="appendEditorInited" ref="CodeEditor7" v-model="appendScript" mode="python" />
            </div>
            <div class="right">
              <div class="title">关键字</div>
              <div class="key-words-wrapper">
                <el-popover
                  v-for="item of allKeyWords"
                  :key="`keywords_${item.id}`"
                  placement="left"
                  title="提示"
                  width="200"
                  trigger="hover"
                  :content="item.desc"
                >
                  <div
                    slot="reference"
                    class="item"
                    @click="insertKeyWord(item)"
                  >
                    {{ item.name }}
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="提取变量" name="extractScript">
          <div class="code-editor-container">
            <div class="left">
              <div class="code-error-msg">{{ extractScriptError || '&nbsp;' }}</div>
              <codeEditor v-if="extractEditorInited" ref="CodeEditor9" v-model="extractScript" mode="python" />
            </div>
            <div class="right">
              <div class="title">关键字</div>
              <div class="key-words-wrapper">
                <el-popover
                  v-for="item of allKeyWords"
                  :key="`keywords_${item.id}`"
                  placement="left"
                  title="提示"
                  width="200"
                  trigger="hover"
                  :content="item.desc"
                >
                  <div
                    slot="reference"
                    class="item"
                    @click="insertKeyWord(item)"
                  >
                    {{ item.name }}
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="断言" name="assertScript">
          <div class="code-editor-container">
            <div class="left">
              <div class="code-error-msg">{{ assertScriptError || '&nbsp;' }}</div>
              <codeEditor v-if="assertEditorInited" ref="CodeEditor8" v-model="assertScript" mode="python" />
            </div>
            <div class="right">
              <div class="title">关键字</div>
              <div class="key-words-wrapper">
                <el-popover
                  v-for="item of allKeyWords"
                  :key="`keywords_${item.id}`"
                  placement="left"
                  title="提示"
                  width="200"
                  trigger="hover"
                  :content="item.desc"
                >
                  <div
                    slot="reference"
                    class="item"
                    @click="insertKeyWord(item)"
                  >
                    {{ item.name }}
                  </div>
                </el-popover>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form>
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
    <aside />
  </div>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import HttpKeyValueTable from './components/HttpKeyValueTable'
import JsonTree from 'vue-json-tree'
import CodeEditor from '@/components/CodeEditor'
import { getProjectEnvTemplate } from '@/api/project'
import { getAllKeyWords, addInterface, updateInterface, getInterfaceInfo } from '@/api/interface'
import { compileCode } from '@/utils/compile-code'
import interfaceFormRules from '@/rules/interfaceFormRule'

const optionsProtocol = [
  { label: 'http', value: 1 },
  { label: 'https', value: 2 }
]

const optionsBodyRayType = [
  { label: 'Text', value: 1 },
  { label: 'Javascript', value: 2 },
  { label: 'JSON', value: 3 },
  { label: 'HTML', value: 4 },
  { label: 'XML', value: 5 }
]

const optionsHttpMethod = [
  { label: 'GET', value: 1 },
  { label: 'POST', value: 2 },
  { label: 'PUT', value: 3 },
  { label: 'DELETE', value: 4 }
]

const optionsBodyType = [
  { label: 'form-data', value: 1 },
  { label: 'x-www-form-urlencoded-data', value: 2 },
  { label: 'raw-data', value: 3 },
  { label: 'binary', value: 4 }
]

const getCodeStrFromKey = function(item) {
  let retArgStr = ''
  if (item.return_args) {
    for (const arg of item.return_args) {
      retArgStr += `${arg}    `
    }
    retArgStr = retArgStr.substring(0, retArgStr.length - 4) + '=    '
  }
  let argStr = ''
  if (item.args) {
    for (const arg of item.args) {
      argStr += `${arg}    `
    }
    argStr = '    ' + argStr.substring(0, argStr.length - 4)
  }
  return `${retArgStr}${item.name}${argStr};`
}

const getCodeStrFromObj = function(codeObj) {
  if (!codeObj) return
  let result = ''
  codeObj.forEach(({ keyword, args, assign }) => {
    const codeStr = getCodeStrFromKey({
      name: keyword,
      args,
      return_args: assign
    })
    result += `${codeStr}\n`
  })
  return result
}

export default {
  components: {
    FileUpload,
    HttpKeyValueTable,
    JsonTree,
    CodeEditor
  },
  props: {
    isEditParams: {
      type: Boolean,
      default: false
    },
    defaultInterface: {
      type: Object,
      default: null
    },
    needsDiffData: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        name: '',
        desc: '',
        request_protocol: '',
        template_server: '',
        template_port: '',
        request_way: '',
        path_url: '',
        encode: '',
        bodyformat: 3,
        bodymessageformat: '',
        bodyRawTextPlain: '',
        bodyRawTextJS: '',
        bodyRawTextHTML: '',
        bodyRawTextXML: ''
      },
      activeTab: 'params',
      paramsList: [{}],
      headerList: [{}],
      bodyFormList: [{}],
      bodyAppList: [{}],
      bodyRawJsonObject: {},
      bodyBinaryFile: [],
      prependScript: '',
      prependScriptError: '',
      prependScriptCompile: [],
      appendScript: '',
      appendScriptError: '',
      appendScriptCompile: [],
      extractScript: '',
      extractScriptError: '',
      extractScriptCompile: [],
      assertScript: '',
      assertScriptError: '',
      assertScriptCompile: [],
      allKeyWords: [],
      serverList: [],
      isShowTreeView: false,
      plainEditorInited: false,
      jsonEditorInited: false,
      jSEditorInited: false,
      xmlEditorInited: false,
      htmlEditorInited: false,
      prependEditorInited: false,
      appendEditorInited: false,
      assertEditorInited: false,
      extractEditorInited: false,
      optionsBodyRayType,
      optionsHttpMethod,
      optionsBodyType,
      optionsProtocol,
      loading: false,
      interfaceFormRules
    }
  },
  computed: {
    isEdit() {
      return this.$route.name === 'InterfaceEdit'
    },
    projectId() {
      return this.$route.params.projectId
    },
    interface() {
      if (this.isEditParams) {
        return this.defaultInterface
      } else {
        return this.$route.params.interface
      }
    },
    moduleId() {
      if (this.isEdit) {
        return this.interface.intermodule
      } else {
        return this.$route.params.moduleId
      }
    },
    activeCodeEditor() {
      if (this.activeTab === 'prependScript') {
        return this.$refs.CodeEditor6
      } else if (this.activeTab === 'appendScript') {
        return this.$refs.CodeEditor7
      } else if (this.activeTab === 'assertScript') {
        return this.$refs.CodeEditor8
      } else if (this.activeTab === 'extractScript') {
        return this.$refs.CodeEditor9
      } else {
        return null
      }
    },
    showKeyWordsPanel() {
      return ['prependScript', 'appendScript', 'assertScript', 'extractScript'].includes(this.activeTab)
    },
    compileRule() {
      return this.allKeyWords.reduce((accu, curr) => {
        const { id, args, return_args } = curr
        accu[curr.name] = {
          id,
          args,
          return_args
        }
        return accu
      }, {})
    },
    paramsListData() {
      return this.getParams(this.paramsList)
    },
    headerListData() {
      return this.getParams(this.headerList)
    },
    hasScriptError() {
      return this.prependScriptError || this.appendScriptError || this.extractScriptError || this.assertScriptError
    }
  },
  watch: {
    'interface': {
      handler() {
        this.initInterfaceFormData()
      }
    },
    'form.bodymessageformat': {
      handler(value) {
        if (value === 1) {
          this.plainEditorInited = true
        } else if (value === 2) {
          this.jSEditorInited = true
        } else if (value === 3) {
          this.jsonEditorInited = true
        } else if (value === 4) {
          this.htmlEditorInited = true
        } else if (value === 5) {
          this.xmlEditorInited = true
        }
      },
      immediate: true
    },
    'activeTab': {
      handler(value) {
        if (value === 'prependScript') {
          this.prependEditorInited = true
        } else if (value === 'appendScript') {
          this.appendEditorInited = true
        } else if (value === 'assertScript') {
          this.assertEditorInited = true
        } else if (value === 'extractScript') {
          this.extractEditorInited = true
        }
      }
    },
    'prependScript': {
      handler(value) {
        const result = compileCode(value, this.compileRule)
        if (result instanceof Error) {
          this.prependScriptError = result.message
        } else {
          this.prependScriptError = ''
          this.prependScriptCompile = result || []
        }
      }
    },
    'appendScript': {
      handler(value) {
        const result = compileCode(value, this.compileRule)
        if (result instanceof Error) {
          this.appendScriptError = result.message
        } else {
          this.appendScriptError = ''
          this.appendScriptCompile = result || []
        }
      }
    },
    'extractScript': {
      handler(value) {
        const result = compileCode(value, this.compileRule)
        if (result instanceof Error) {
          this.extractScriptError = result.message
        } else {
          this.extractScriptError = ''
          this.extractScriptCompile = result || []
        }
      }
    },
    'assertScript': {
      handler(value) {
        const result = compileCode(value, this.compileRule)
        if (result instanceof Error) {
          this.assertScriptError = result.message
        } else {
          this.assertScriptError = ''
          this.assertScriptCompile = result || []
        }
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    if (to.name === 'InterfaceEdit' && !to.params.interface) {
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
  created() {
    this.loading = true
    Promise.all([
      this.initKeyWords(),
      this.initServerList()
    ]).then(_ => {
      this.initInterfaceFormData()
    }).finally(_ => {
      this.loading = false
    })
  },
  methods: {
    initKeyWords() {
      return getAllKeyWords().then(res => {
        this.allKeyWords = res.data
      })
    },
    initServerList() {
      return getProjectEnvTemplate({
        id: this.projectId
      }).then(({ data }) => {
        this.serverList = data
      })
    },
    initInterfaceFormData() {
      if (this.interface) {
        const { name, desc, request_protocol, template_server, template_port, request_way, path_url, bodyformat, bodymessageformat, params, headerparams, bodyparams, preprocessing, postprocessing, assertion, variable } = this.interface
        // 记录原始form用于提交时比对差异, 整个原始form有2部分, originFormData 和 originParamData
        this.originFormData = {
          name, desc, request_protocol, template_server, template_port, request_way, path_url, bodyformat, bodymessageformat
        }
        this.originParamData = {
          params, headerparams, bodyparams, preprocessing, postprocessing, assertion, variable
        }
        for (const key in this.originFormData) {
          this.form[key] = this.originFormData[key]
        }
        if (params) {
          this.paramsList = params.map(({ paramname, variable_name, desc }) => ({
            key: paramname,
            value: variable_name,
            desc
          }))
        }
        if (headerparams) {
          this.headerList = headerparams.map(({ paramname, variable_name, desc }) => ({
            key: paramname,
            value: variable_name,
            desc
          }))
        }
        // TODO 现在body暂时只考虑JSON
        this.bodyRawJsonObject = bodyparams
        this.prependScript = getCodeStrFromObj(preprocessing)
        this.appendScript = getCodeStrFromObj(postprocessing)
        this.assertScript = getCodeStrFromObj(assertion)
        this.extractScript = getCodeStrFromObj(variable)
      } else {
        // 设置默认raw-data的格式为JSON
        this.form.bodymessageformat = 3
      }
    },
    toggleTreeView() {
      this.isShowTreeView = !this.isShowTreeView
    },
    insertKeyWord(item) {
      if (!this.activeCodeEditor) {
        return
      }
      this.activeCodeEditor.replaceSelection(getCodeStrFromKey(item))
      this.activeCodeEditor.newLine()
    },
    compileScript(code) {
      compileCode(code, this.compileRule)
    },
    handleCancel() {
      if (this.isEditParams) {
        this.$emit('close')
      } else {
        this.$router.go(-1)
      }
    },
    handleExport() {
      this.$confirm('从当前页面导出数据源, 是否继续?', '提示').then(_ => {
        this.loading = true
        import('@/vendor/Export2Excel').then(excel => {
          console.log('then')
          const tHeader = ['变量', '变量说明', '变量位置', '值1', '值2']
          const filterVal = ['variable_name', 'desc', 'position']
          const data = [
            { variable_name: 'TestName', desc: '用例说明', position: 'other' },
            { variable_name: 'TestDesc', desc: '用例说明', position: 'other' },
            { variable_name: 'TestTags', desc: '用例标签', position: 'other' },
            ...this.getExcelData(this.paramsListData, 'params'),
            ...this.getExcelData(this.headerListData, 'header'),
            ...this.getExcelData(this.bodyRawJsonObject, 'body'),
            ...this.getExcelData(this.prependScriptCompile, 'prepend'),
            ...this.getExcelData(this.appendScriptCompile, 'append'),
            ...this.getExcelData(this.assertScriptCompile, 'assert'),
            ...this.getExcelData(this.extractScriptCompile, 'variable')
          ]
          console.log(data)

          excel.export_json_to_excel({
            header: tHeader,
            data: this.formatJson(filterVal, data),
            filename: '接口数据源导出文件',
            autoWidth: true,
            bookType: 'xlsx'
          })
        }).finally(_ => {
          this.loading = false
        })
      }).catch(_ => {})
    },
    getExcelData(data, position) {
      if (position === 'params' || position === 'header') {
        return data.map(({ variable_name, desc }) => {
          return {
            variable_name,
            desc,
            position
          }
        })
      } else if (position === 'body') {
        // stringify之后匹配字符串
        const match = JSON.stringify(data).match(/\${[^${}]*}/g)
        if (match) {
          return match.map(str => {
            const variable_name = str.match(/^\${(.*)}$/)[1]
            return {
              variable_name,
              position
            }
          })
        } else {
          return []
        }
      } else if (position === 'prepend' || position === 'append' || position === 'assert' || position === 'variable') {
        const result = []
        data.forEach(({ assign, args }) => {
          const matchFunc = (str) => {
            const match = str.match(/^\${(.*)}$/)
            if (match && match[1]) {
              result.push({
                variable_name: match[1],
                position
              })
            }
          }
          assign && assign.forEach(matchFunc)
          args && args.forEach(matchFunc)
        })
        return result
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    handleConfirm() {
      this.$refs.interfaceForm.validate(valid => {
        if (!valid) {
          return
        }
        if (this.hasScriptError) {
          this.$message({
            message: this.hasScriptError,
            type: 'error'
          })
          return
        }
        const formData = {
          interface_type: 1,
          project: this.projectId,
          intermodule: this.moduleId,
          name: this.form.name,
          desc: this.form.desc,
          request_protocol: this.form.request_protocol,
          template_server: this.form.template_server,
          template_port: this.form.template_port,
          request_way: this.form.request_way,
          path_url: this.form.path_url,
          bodyformat: this.form.bodyformat,
          bodymessageformat: this.form.bodymessageformat,
          params: this.paramsListData,
          headerparams: this.headerListData,
          bodyparams: this.getBodyParams(this.form.bodyformat),
          preprocessing: this.prependScriptCompile,
          postprocessing: this.appendScriptCompile,
          assertion: this.assertScriptCompile,
          variable: this.extractScriptCompile
        }
        if (this.isEditParams) {
          this.$emit('submit', this.needsDiffData ? this.getDiffData(formData) : formData)
        } else if (this.isEdit) {
          this.updateInterface(formData)
        } else {
          this.saveInterface(formData)
        }
      })
    },
    saveInterface(formData) {
      addInterface(formData).then(res => {
        this.$message({
          type: 'success',
          message: '新建接口成功'
        })
        this.$router.go(-1)
      })
    },
    updateInterface(formData) {
      const data = {
        ...this.getDiffData(formData),
        project: this.projectId,
        intermodule: this.interface.intermodule,
        interface_type: 1
      }
      updateInterface({
        id: this.interface.id
      }, data).then(res => {
        this.$message({
          type: 'success',
          message: '更新接口成功'
        })
        this.$router.go(-1)
      })
    },
    getParams(params) {
      const result = []
      params.forEach(({ key, value, desc }) => {
        if (key) {
          result.push({
            paramname: key,
            variable_name: value,
            desc
          })
        }
      })
      return result
    },
    getBodyParams(type) {
      // TODO: 现在只考虑了bodyType是RawJSON
      if (type === 3) {
        return this.bodyRawJsonObject
      }
    },
    getDiffData(formData) {
      // 只将有变化的数据提交
      const result = {}
      const isChange = (a, b) => {
        // 直接比较JSON串
        return JSON.stringify(a) !== JSON.stringify(b)
      }
      Object.keys(this.originFormData).forEach(key => {
        if (isChange(formData[key], this.originFormData[key])) {
          result[key] = formData[key]
        }
      })
      Object.keys(this.originParamData).forEach(key => {
        if (isChange(formData[key], this.originParamData[key])) {
          result[key] = formData[key]
        }
      })
      console.log('diff Data:', formData, this.originFormData, this.originParamData)
      console.log('diff Result: ', result)
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-interface-container {
    min-height: 100vh;
    padding: 0 30px 90px;

    &.auto-height {
      height: auto
    }

    .add-interface-title {
      font-size: 20px;
      line-height: 28px;
      padding: 20px 0;
    }

    .dialog-footer {
      position: absolute;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .code-error-msg {
      padding: 10px;
      color: red;
      white-space: nowrap;
      overflow: auto;
      background: #F1F5F8;
      border-bottom: 1px solid #ddd;
    }

    >>> .el-form-item {
      margin-right: 30px;
    }
    .form-block-item {
      display: block;
      >>> label {
        float: left;
      }
      >>> .el-form-item__content {
        display: block;
        margin-left: 80px;
      }
    }

    .param-tabs {
      margin-top: 20px;

      >>> .key-value-table-container {
        max-height: calc(100vh - 500px);
        overflow: auto;
      }

      >>> .el-tabs__header.is-top {
        margin-bottom: 0;
        font-size: 0;

        .el-tabs__nav-wrap {
          display: inline-block;

          &:after {
            background-color:  #a1a3a5
          }

          .el-tabs__item.is-active,  .el-tabs__item:hover {
            color: #303133;
            background: #EFEFEF
          }

          .el-tabs__item {
            padding: 0 30px;
          }

          .el-tabs__item.is-top:nth-child(2), .el-tabs__item.is-top:last-child {
            padding-left: 30px;
            padding-right: 30px;
          }

          .el-tabs__active-bar {
            background-color: #184440;
            bottom: 2px;
          }

          .el-tabs__nav-scroll {
            border: 1px solid #a1a3a5;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            border-bottom: 0;
          }

          .el-tabs__item.is-active,  .el-tabs__item:hover {
            border-right-color: #a1a3a5;
            border-left-color: #a1a3a5;
            &:last-of-type {
              border-right-color: transparent;
            }
          }

        }
      }

      >>> .el-tabs__content {
        padding: 0;
        border: 1px solid #a1a3a5;
        border-top-right-radius: 5px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }

      .body-radio-line {
        padding: 15px;
        height: 30px;
        line-height: 30px;
        box-sizing: content-box;
        border-bottom: 1px solid #a1a3a5;
        background: #EFEFEF;
      }

      .body-type-box {
        display: flex;
        .left {
          width: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #C0C4CC;
          margin-right: 2px;
          transition: .1s;
          cursor: pointer;
          &:hover {
            background: #FFF;
            border-color: #409EFF;
            color: #409EFF;
          }
        }
        .right {
          flex-grow: 1;
          height: 386px;
          overflow: auto;
          border-radius: 5px;
        }
      }

      .code-editor-container {
        display: flex;
        .left {
          flex-grow: 1;
          width: 0;
        }
        .right {
          width: 300px;
          padding: 15px;
          border-left: 1px solid #C0C4CC;
          .title {
            margin-bottom: 15px;
          }
          .key-words-wrapper {
            max-height: 350px;
            overflow: auto;
            .item {
              cursor: pointer;
              transition: all .3s;
              padding: 10px 0;
              color: #259788;
              &:hover {
                color: #409EFF
              }
            }
          }
        }
      }
    }

    .key-words-panel {
      position: fixed;
      right: 20px;
      top: 15vh;
      bottom: 15vh;
      background: #fff;
      width: 107px;
      height: 500px;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #CCD;
      z-index: 1;

    }
  }
</style>
