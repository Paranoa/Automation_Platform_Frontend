<template>
  <div v-loading="loading" class="execution-result-container">
    <div class="result-title">
      测试结果-单接口
    </div>
    <div class="result-subtitle">
      接口/业务名称：{{ interfaceName }}
    </div>
    <div v-show="caseResultList.length" class="result-content">
      <div class="left">
        <div class="case-item-title">用例名称</div>
        <div class="case-items-container">
          <div
            v-for="caseObj of caseResultList"
            :key="caseObj.name"
            class="case-item"
            :class="{ 'active': caseSelected === caseObj, 'block': interfaceType === 2 }"
            @click="handleCaseClick(caseObj)"
          >
            <template v-if="interfaceType === 2">
              <div class="case-item-sub-title" @click="handleCaseDetailClick(caseObj)">
                <span v-if="caseObj.status">
                  <svg-icon v-if="caseObj.status === 'FAIL'" icon-class="failed" />
                  <svg-icon v-else icon-class="success" />
                </span>
                <span>{{ caseObj.name }}</span>
              </div>
              <div v-if="caseObj.api_detail" class="case-item-sub-container" :class="{ 'collapsed': caseObj.collapsed }">
                <div
                  v-for="c of caseObj.api_detail"
                  :key="c.name"
                  class="case-item-sub-item"
                  :class="{ active: caseDisplay === c}"
                  @click="caseDisplay = c; caseSelected = caseObj"
                >
                  <span v-if="c.status">
                    <svg-icon v-if="c.status === 'FAIL'" icon-class="failed" />
                    <svg-icon v-else icon-class="success" />
                  </span>
                  <span>{{ c.name }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <span v-if="caseObj.status" class="left">
                <svg-icon v-if="caseObj.status === 'FAIL'" icon-class="failed" />
                <svg-icon v-else icon-class="success" />
              </span>
              <span>{{ caseObj.name }}</span>
              <span class="right" />
            </template>
          </div>
        </div>
      </div>
      <div class="right">
        <el-tabs v-model="activeTabName" type="card">
          <el-tab-pane label="返回结果" name="response">
            <div ref="pre-container-response" class="pre-container">
              <pre v-if="caseDisplay">{{ caseDisplay.response_info }}</pre>
            </div>
          </el-tab-pane>
          <el-tab-pane label="请求信息" name="request">
            <div ref="pre-container-request" class="pre-container">
              <pre v-if="caseDisplay">{{ caseDisplay.request_info }}</pre>
            </div>
          </el-tab-pane>
          <el-tab-pane label="步骤信息" name="step">
            <div ref="pre-container-step" class="pre-container">
              <pre v-if="caseDisplay">{{ caseDisplay.step_info }}</pre>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div v-if="isPending" class="result-pending">
      --- 该接口暂无执行结果,请等待 ---
    </div>
    <div v-if="isException">
      <iframe :srcdoc="exceptionContent " class="iframe-exception" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">返回</el-button>
    </span>
  </div>
</template>

<script>
import { executeInterfaceResult } from '@/api/interface'
export default {
  data() {
    return {
      activeTabName: 'response',
      interfaceName: '',
      interfaceType: null,
      caseSelected: null,
      caseDisplay: null,
      loading: false,
      caseResultList: [],
      isPending: false,
      isException: false,
      exceptionContent: ''
    }
  },
  computed: {
    interfaceId() {
      return this.$route.params.id
    },
    currPreContainer() {
      return this.$refs[`pre-container-${this.activeTabName}`]
    }
  },
  watch: {
    caseDisplay() {
      this.currPreContainer.scrollTop = 0
    }
  },
  created() {
    this.loading = true
    this.getResult().then(res => {
      this.caseResultList = res
      if (this.caseResultList.length) {
        this.caseSelected = this.caseResultList[0]
        if (this.caseResultList[0].api_detail && this.caseResultList[0].api_detail[0]) {
          this.caseDisplay = this.caseResultList[0].api_detail[0]
        } else {
          this.caseDisplay = this.caseResultList[0]
        }
      }
    }).catch(e => {
      this.$message({
        message: e.message,
        type: 'error'
      })
    }).finally(_ => { this.loading = false })
  },
  methods: {
    getResult() {
      return new Promise((resolve, reject) => {
        executeInterfaceResult({
          id: this.interfaceId
        }).then(res => {
          const data = res.data
          const { tip } = data
          this.interfaceName = data.name
          if (tip === 'DoesNotExist') {
            this.isPending = true
            resolve([])
          } else {
            if (data.result && data.result.is_exception) {
              this.isException = true
              this.exceptionContent = data.result.result_info
              resolve([])
            } else if (data.result && data.result.result_info) {
              this.interfaceType = data.result.interface_type
              resolve(data.result.result_info)
            } else {
              reject(new Error('执行结果数据错误'))
            }
          }
        })
      })
    },
    handleCaseClick(caseObj) {
      if (this.interfaceType === 1) {
        this.caseSelected = caseObj
        if (caseObj.api_detail && caseObj.api_detail[0]) {
          this.caseDisplay = caseObj.api_detail[0]
        }
      }
    },
    handleCaseDetailClick(caseObj) {
      if (this.caseSelected !== caseObj) {
        this.caseSelected = caseObj
        const details = caseObj.api_detail
        if (details[0]) {
          this.caseDisplay = details[0]
        }
        this.$set(caseObj, 'collapsed', false)
      } else {
        this.$set(caseObj, 'collapsed', !caseObj.collapsed)
      }
    },
    handleCancel() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.execution-result-container {
  border: 1px solid #ddd;
  padding: 0 30px 90px;
  min-height: 100vh;
  .result-title {
    font-size: 20px;
    margin: 30px 0;
  }

  .result-subtitle {
    font-size: 14px;
    margin: 20px 0;
  }

  .result-content {
    display: flex;
    >.left {
      width: 360px;
      min-width: 360px;
      border: 1px solid #75787B;
      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .case-items-container {
        max-height: 400px;
        overflow: auto;
      }
      .case-item {
        display: flex;
        padding: 10px 0;
        justify-content: center;
        align-items: center;
        border-bottom: 1px dashed #75787B;
        cursor: pointer;

        >.left {
          width: 120px;
          text-align: right;
          padding-right: 10px;
        }
        >.right {
          width: 120px;
        }

        &.block {
          display: block;
          padding: 0;
        }

        &.active:not(.block), &:hover:not(.block) {
          color: #409EFF;
        }

        &.active {
          .case-item-sub-title {
            color: #409EFF;
            background: #daeeff;
          }
        }

        .case-item-sub-title {
          padding: 10px;
          padding-bottom: 5px;
          background: #eee;
          cursor: pointer;
        }

        .case-item-sub-container {
          padding-left: 40px;
          transition: all .3s;
          max-height: 500px;
          overflow: hidden;
          cursor: pointer;

          &.collapsed {
            max-height: 0;
          }

          .case-item-sub-item {
            padding: 5px;
            &.active {
              color: #409EFF;
            }
          }
        }
      }
      .case-item-title {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        border-bottom: 1px dashed #75787B;
      }
    }
    >.right {
      flex-grow: 1;
      overflow: auto;
      >>> .el-tabs__header {
        margin-bottom: 0;
        border-color: #75787B;
        .el-tabs__nav, .el-tabs__item {
          border-color: #75787B;
        }
        .el-tabs__item:hover {
          color: #888;
        }
        .el-tabs__item.is-active {
          background: #EFEFEF;
          color: #303133;
        }
        .el-tabs__nav {
          border-left: none;
          border-top-left-radius: 0;
        }
      }

      >>> .el-tabs__content {
        border-right: 1px solid #75787B;
        border-bottom: 1px solid #75787B;
      }

      .pre-container {
        background: #F1F5F8;
        line-height: 1.5;
        height: 400px;
        padding: 20px;
        overflow: auto;
        pre {
          margin: 0
        }
      }
    }
  }

  .result-pending {
    font-size: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 100px;
  }

  .dialog-footer {
    position: absolute;
    bottom: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .iframe-exception {
    width: 100%;
    height: 500px;
    border: none;
  }
}
</style>
