<template>
  <div class="json-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/htmlmixed/htmlmixed'
import 'codemirror/mode/python/python.js'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/xml-hint'
import 'codemirror/addon/hint/html-hint'
import 'codemirror/addon/display/autorefresh.js'

export default {
  name: 'CodeEditor',
  /* eslint-disable vue/require-prop-types */
  props: {
    value: {
      type: [Object, String],
      default: ''
    },
    mode: {
      type: String,
      default: 'application/json'
    }
  },
  data() {
    return {
      codeEditor: false
    }
  },
  watch: {
    value(value) {
      if (this.mode === 'application/json') {
        return
      }
      const editorValue = this.codeEditor.getValue()
      if (value !== editorValue) {
        this.codeEditor.setValue(this.value)
      }
    }
  },
  mounted() {
    this.codeEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: this.mode,
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      autoRefresh: true
    })

    if (this.mode === 'application/json') {
      this.codeEditor.setValue(JSON.stringify(this.value, null, 2))
    } else {
      this.codeEditor.setValue(this.value)
    }

    this.codeEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      if (this.mode === 'application/json') {
        try {
          const value = JSON.parse(cm.getValue())
          this.$emit('input', value)
        } catch (e) {
          this.$emit('input', null)
        }
      } else {
        this.$emit('input', cm.getValue())
      }
    })
  },
  methods: {
    getValue() {
      return this.codeEditor.getValue()
    },
    getEditor() {
      return this.codeEditor
    },
    replaceSelection(...args) {
      /* 替换选中文本/光标处插入 */
      return this.codeEditor.replaceSelection(...args)
    },
    newLine() {
      /* 插入新行并缩进（Enter） */
      CodeMirror.commands.newlineAndIndent(this.codeEditor)
    }
  }
}
</script>

<style scoped lang="scss">
.json-editor{
  height: 100%;
  position: relative;
}
.json-editor >>> .CodeMirror {
  height: auto;
  min-height: 386px;
}
.json-editor >>> .CodeMirror-scroll{
  min-height: 386px;
  background: #F1F5F8;

  .CodeMirror-gutters {
    border-right: 1px solid #ddd;
  }
}
.json-editor >>> .cm-s-rubyblue span.cm-string {
  color: #F08047;
}
</style>
