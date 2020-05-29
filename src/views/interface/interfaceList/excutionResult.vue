<template>
  <div v-loading="loading" class="excution-result-container">
    <div class="result-title">
      测试结果-单接口
    </div>
    <div class="result-subtitle">
      接口/业务名称：{{ interfaceName }}
    </div>
    <div v-if="caseResultList.length" class="result-content">
      <div class="left">
        <div class="case-item disabled">用例名称</div>
        <div
          v-for="caseObj of caseResultList"
          :key="caseObj.name"
          class="case-item"
          :class="{ 'active': caseSelected === caseObj }"
          @click="caseSelected = caseObj"
        >
          <span class="left">
            <svg-icon v-if="caseObj.status === 'Fail'" icon-class="failed" />
            <svg-icon v-else icon-class="success" />
          </span>
          <span>{{ caseObj.name }}</span>
          <span class="right" />
        </div>
      </div>
      <div class="right">
        <el-tabs v-model="activeTabName" type="card">
          <el-tab-pane label="返回结果" name="response">
            <div class="pre-container">
              <pre v-if="caseSelected">{{ caseSelected.response_info }}</pre>
            </div>
          </el-tab-pane>
          <el-tab-pane label="请求信息" name="request">
            <div class="pre-container">
              <pre v-if="caseSelected">{{ caseSelected.request_info }}</pre>
            </div>
          </el-tab-pane>
          <el-tab-pane label="断言结果" name="assert">
            <div class="pre-container">
              <pre v-if="caseSelected">{{ caseSelected.assert_info }}</pre>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div v-else class="result-pending">
      --- 该接口暂无执行结果,请等待 ---
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">返回</el-button>
    </span>
  </div>
</template>

<script>
import { excuteInterfaceResult } from '@/api/interface'
export default {
  data() {
    return {
      activeTabName: 'response',
      caseSelected: null,
      loading: false,
      caseResultList: []
    }
  },
  computed: {
    interfaceId() {
      return this.$route.params.id
    },
    interfaceName() {
      return this.$route.params.name
    }
  },
  created() {
    this.loading = true
    this.getResult().then(res => {
      this.caseResultList = res
      if (this.caseResultList.length) {
        this.caseSelected = this.caseResultList[0]
      }
    }).finally(_ => { this.loading = false })
  },
  methods: {
    getResult() {
      return new Promise((resolve, reject) => {
        excuteInterfaceResult({
          id: this.interfaceId
        }).then(res => {
          const { tip } = res.data
          if (tip === 'DoesNotExist') {
            resolve([])
          } else {
            if (res.data.result && res.data.result.result_info) {
              resolve(res.data.result.result_info)
            } else {
              reject(new Error('执行结果数据错误'))
            }
          }
        })
      })
    },
    handleCancel() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.excution-result-container {
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
      .case-item {
        display: flex;
        height: 40px;
        justify-content: center;
        align-items: center;
        border-bottom: 1px dashed #75787B;

        .left {
          width: 120px;
          text-align: right;
          padding-right: 10px;
        }
        .right {
          width: 120px;
        }

        &:not(.disabled) {
          cursor: pointer;
        }
        &:hover:not(.disabled), &.active {
          color: #409EFF;
        }
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
}
</style>
