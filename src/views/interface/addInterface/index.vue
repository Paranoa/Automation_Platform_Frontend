<template>
  <el-dialog
    class="add-interface-container"
    title="新建接口"
    :visible="visible"
    width="80%"
    :close-on-click-modal="false"
    :before-close="handleCancel"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="接口名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="接口描述" prop="desc">
        <el-input v-model="form.desc" type="textarea" resize="none" />
      </el-form-item>
      <el-row>
        <el-col :span="6">
          <el-form-item label="协议" prop="request_protocol">
            <el-select v-model="form.request_protocol">
              <el-option v-for="option of optionsProtocol" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="服务器名 or IP" prop="path_url" label-width="150px">
            <el-select v-model="form.server">
              <el-option label="服务器" value="服务器"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="端口" prop="port">
            <el-input v-model="form.port" placeholder="port" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="请求方式" prop="method">
            <el-select v-model="form.request_way"  placeholder="HttpMethod">
              <el-option v-for="option of optionsHttpMethod" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="路径" prop="path_url">
            <el-input v-model="form.path_url" placeholder="url" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="编码格式" prop="encode">
            <el-input v-model="form.encode" placeholder="encode" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-tabs type="border-card" v-model="activeTab" style="margin-left: 30px;">
        <el-tab-pane label="PARAMS" name="params">
          <HttpKeyValueTable type="query" :key-value-list="paramsList" />
        </el-tab-pane>
        <el-tab-pane label="HEADER" name="header">
          <HttpKeyValueTable type="keyValue" :key-value-list="headerList" />
        </el-tab-pane>
        <el-tab-pane label="BODY" name="body">
          <div class="body-radio-line">
            <el-radio v-for="option of optionsBodyType" v-model="form.bodyformat" :key="option.value" :label="option.value">{{ option.label }}</el-radio>
            <el-select
              v-if="form.bodyformat === 3"
              v-model="form.bodymessageformat"
              placeholder="HttpMethod" size="mini"
              style="float: right">
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
                <JsonTree :raw="bodyRawJsonText" />
              </div>
              <div>
                <codeEditor v-if="plainEditorInited" v-show="form.bodymessageformat === 1" mode="" ref="CodeEditor1" v-model="form.bodyRawTextPlain" />
                <codeEditor v-if="jSEditorInited" v-show="form.bodymessageformat === 2" mode="javascript" ref="CodeEditor2" v-model="form.bodyRawTextJS" />
                <codeEditor v-if="jsonEditorInited" v-show="form.bodymessageformat === 3 && !isShowTreeView" mode="application/json" ref="CodeEditor3" v-model="bodyRawJsonObject" />
                <codeEditor v-if="htmlEditorInited" v-show="form.bodymessageformat === 4" mode="htmlmixed" ref="CodeEditor4" v-model="form.bodyRawTextHTML" />
                <codeEditor v-if="xmlEditorInited" v-show="form.bodymessageformat === 5" mode="xml" ref="CodeEditor5" v-model="form.bodyRawTextXML" />
              </div>
            </div>
          </div>
          <div v-show="form.bodyformat === '4'">
            <FileUpload v-model="bodyBinaryFile" action="/"/>
          </div>
        </el-tab-pane>
        <el-tab-pane label="前置处理" name="prependScript">
          <codeEditor v-if="prependEditorInited" mode="python" ref="CodeEditor6" v-model="prependScript" />
        </el-tab-pane>
        <el-tab-pane label="后置处理" name="appendScript">
          <codeEditor v-if="appendEditorInited" mode="python" ref="CodeEditor7" v-model="appendScript" />
        </el-tab-pane>
        <el-tab-pane label="断言" name="assertScript">
          <codeEditor v-if="assertEditorInited" mode="python" ref="CodeEditor8" v-model="assertScript" />
        </el-tab-pane>
      </el-tabs>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
    <aside v-show="showKeyWordsPanel" class="key-words-panel">
      <div class="title">数据关键字</div>
      <div class="item" v-for="item of allKeyWords" :key="item.id" @click="insertKeyWord(item)">{{ item.name }}</div>
    </aside>
  </el-dialog>
</template>

<script>
import FileUpload from '@/components/FileUpload'
import HttpKeyValueTable from './components/HttpKeyValueTable'
import JsonTree from 'vue-json-tree'
import CodeEditor from '@/components/CodeEditor'
import { getAllKeyWords, addInterface } from '@/api/interface'
import { compileCode } from '@/utils'

const optionsProtocol = [
  { label: 'http', value: 1 },
  { label: 'https', value: 2 },
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
  { label: 'DELETE', value: 4 },
]

const optionsBodyType = [
  { label: 'form-data', value: 1 },
  { label: 'x-www-form-urlencoded-data', value: 2 },
  { label: 'raw-data', value: 3 },
  { label: 'binary', value: 4 },
]

const getCodeStr = function (item) {
  if (item.keytype === 1) {
    let paramStr = ''
    for (const param of item.params_constraint) {
      paramStr += `${param.paramname},`
    }
    paramStr = paramStr.substring(0, paramStr.length - 1)
    return `${item.value}[${paramStr}];`
  } else if (item.keytype === 2) {
    let paramStr = ''
    for (const param of item.params_constraint) {
      paramStr += `${param.paramname},`
    }
    paramStr = paramStr.substring(0, paramStr.length - 1)
    return `${item.value}(${paramStr});`
  } else if (item.keytype === 3) {
    return ` ${item.value} `
  }
}

export default {
  components: {
    FileUpload,
    HttpKeyValueTable,
    JsonTree,
    CodeEditor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number
    },
    interface: {
      type: Object
    },
    module: {
      type: Object
    }
  },
  data() {
    return {
      form: {
        name: '',
        desc: '',
        request_protocol: '',
        server: '',
        port: '',
        request_way: '',
        path_url: '',
        encode: '',
        bodyformat: 3,
        bodymessageformat: 3,
        bodyRawTextPlain: '',
        bodyRawTextJS: '',
        bodyRawTextHTML: '',
        bodyRawTextXML: '',
      },
      activeTab: 'params',
      paramsList: [{}],
      headerList: [{}],
      bodyFormList: [{}],
      bodyAppList: [{}],
      bodyRawJsonObject: {},
      bodyBinaryFile: [],
      prependScript: '',
      prependScriptCompile: [],
      appendScript: '',
      appendScriptCompile: [],
      assertScript: '',
      assertScriptCompile: [],
      allKeyWords: [],
      isShowTreeView: false,
      plainEditorInited: false,
      jsonEditorInited: false,
      jSEditorInited: false,
      xmlEditorInited: false,
      htmlEditorInited: false,
      prependEditorInited: false,
      appendEditorInited: false,
      assertEditorInited: false,
      optionsBodyRayType,
      optionsHttpMethod,
      optionsBodyType,
      optionsProtocol
    }
  },
  computed: {
    isEdit() {
      return this.interface
    },
    bodyRawJsonText() {
      try {
        return JSON.stringify(JSON.parse(this.bodyRawJsonObject))
      } catch (e) {
        return ''
      }
      return ''
    },
    activeCodeEditor() {
      if (this.activeTab === 'prependScript') {
        return this.$refs.CodeEditor6
      } else if (this.activeTab === 'appendScript') {
        return this.$refs.CodeEditor7
      } else if (this.activeTab === 'assertScript') {
        return this.$refs.CodeEditor8
      }
    },
    showKeyWordsPanel() {
      return ['prependScript', 'appendScript', 'assertScript'].includes(this.activeTab)
    },
    compileRule() {
      return this.allKeyWords.reduce((accu, curr) => {
        const { id, params_constraint, count, keytype } = curr
        if (keytype === 3) {
          accu._keywords.push({
            id,
            value: curr.value
          })
        } else {
          accu[curr.value] = {
            id,
            params_constraint,
            count,
            keytype
          }
        }
        return accu
      }, {
        _keywords: []
      })
    }
  },
  watch: {
    'visible': {
      handler(value) {
        if (value) {
          if (!this.allKeyWordsInited) {
            getAllKeyWords().then(res => {
              this.allKeyWords = res.data
              this.allKeyWordsInited = true
            })
          }
          if (this.interface) {
            const { name, desc, request_protocol, server, port, request_way, path_url, bodyformat, bodymessageformat } = this.interface
            this.originFormData = {
              name, desc, request_protocol, server, port, request_way, path_url, bodyformat, bodymessageformat
            }
            for (const key in this.originFormData) {
              this.form[key] = this.originFormData[key]
            }
          }
        }
      },
      immediate: true
    },
    'form.bodymessageformat': {
      handler(value) {
        if (value == 1) {
          this.plainEditorInited = true
        } else if (value === 2) {
          this.jSEditorInited = true
        } else if (value == 3) {
          this.jsonEditorInited = true
        } else if (value == 4) {
          this.htmlEditorInited = true
        } else if (value == 5) {
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
        }
      }
    },
    'prependScript': {
      handler(value) {
        this.prependScriptCompile = compileCode(value, this.compileRule)
      }
    },
    'appendScript': {
      handler(value) {
        this.appendScriptCompile = compileCode(value, this.compileRule)
      }
    },
    'assertScript': {
      handler(value) {
        this.assertScriptCompile = compileCode(value, this.compileRule)
      }
    }
  },
  methods: {
    toggleTreeView() {
      this.isShowTreeView = !this.isShowTreeView
    },
    insertKeyWord(item) {
      if (!this.activeCodeEditor) {
        return
      }
      this.activeCodeEditor.replaceSelection(getCodeStr(item))
      // if (item.keytype !== 3) {
      //   this.activeCodeEditor.newLine()
      // }
    },
    compileScript(code) {
      compileCode(code, this.compileRule)
    },
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      const getParams = (params) => {
        return params.reduce((accu, curr) => {
          const { key, value, desc } = curr
          if (key && value) {
            return accu.concat({
              paramname: key,
              variable_name: value,
              desc,
            })
          } else {
            return accu
          }
        }, [])
      }
      
      const getBodyParams = (type) => {
        if (type === 3) {
          return JSON.parse(this.bodyRawJsonObject)
        }
      }

      const formData = {
        project: this.projectId,
        intermodule: this.module.id,
        name: this.form.name,
        desc: this.form.desc,
        request_protocol: this.form.request_protocol,
        server: this.form.server,
        port: this.form.port,
        request_way: this.form.request_way,
        path_url: this.form.path_url,
        bodyformat: this.form.bodyformat,
        bodymessageformat: this.form.bodymessageformat,
        params: getParams(this.paramsList),
        headerparams: getParams(this.headerList),
        bodyparams: getBodyParams(this.form.bodyformat)
      }

      console.log(formData)
      console.log(this.prependScriptCompile)
      return
      addInterface(formData).then(res => {
        this.$message({
          type: 'success',
          message: '新建接口成功'
        })
        this.$emit('update:visible', false)
      })
    },
    getDiffData(formData) {
      // 只将有变化的数据提交
      const result = {}
      for (const key in this.originFormData) {
        if (formData[key] !== this.originFormData[key]) {
          result[key] = formData[key]
        }
      }
      if (Object.keys(result)) {
        return result
      } else {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-interface-container {
    .body-radio-line {
      margin-bottom: 15px;
    }
    .body-type-box {
      display: flex;
      .left {
        width: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #C0C4CC;
        margin-right: 2px;
        border-radius: 5px;
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

      .title {
        font-size: 16px;
        padding-bottom: 5px;
        color: #C0C4CC;
      }

      .item {
        cursor: pointer;
        transition: all .3s;
        padding: 5px 0;
        &:hover {
          color: #409EFF
        }
      }
    }
  }
</style>
