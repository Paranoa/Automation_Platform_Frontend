<template>
  <el-dialog
    title="定时任务"
    :visible="visible"
    width="60%"
    :before-close="
      () => {
        updateVisible(false)
      }
    "
    append-to-body
  >
    <div>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="环境">
          <el-select v-model="form.server_id" placeholder="请选择环境">
            <el-option
              v-for="server of serverList"
              :key="server.id"
              :label="server.name"
              :value="server.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行机">
          <el-select v-model="form.executive_machine" placeholder="请选择执行机">
            <el-option
              v-for="executor of executorList"
              :key="executor.id"
              :label="executor.name"
              :value="executor.ip"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行类型">
          <el-select v-model="form.trigger" placeholder="请选择执行类型">
            <el-option
              v-for="option of optionsTaskType"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <template v-if="form.trigger === 'cron'">
          <el-form-item label="执行周期">
            <el-select v-model="form.date_type" placeholder="请选择执行周期">
              <el-option
                v-for="option of optionsCycle"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <template v-if="form.date_type === '2'">
            <el-form-item label="每周">
              <el-checkbox-group v-model="form.day_of_week">
                <el-checkbox
                  v-for="option of optionsWeek"
                  :key="option.value"
                  :label="option.value"
                >{{ option.label }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </template>
          <template v-else-if="form.date_type === '3'">
            <el-form-item label="日期">
              <el-select v-model="form.day">
                <el-option
                  v-for="option of Array.from(new Array(31)).map((_, index) => ({
                    value: index + 1 + '',
                    label: `${index + 1}号`
                  }))"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </el-select>
            </el-form-item>
          </template>
        </template>
        <template v-if="['cron'].includes(form.trigger)">
          <el-form-item label="执行时间">
            <el-time-picker
              v-model="form.run_time"
              value-format="HH:mm"
              type="time"
              :picker-options="{
                format: 'HH:mm'
              }"
            />
          </el-form-item>
        </template>
        <template v-else-if="['date'].includes(form.trigger)">
          <el-form-item label="执行时间">
            <el-date-picker
              v-model="form.run_date"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              :picker-options="{
                format: 'yyyy-MM-dd HH:mm:ss'
              }"
            />
          </el-form-item>
        </template>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button v-loading="loading" type="primary" @click="handleSubmit">确 认</el-button>
      <el-button
        @click="
          () => {
            updateVisible(false)
          }
        "
      >返 回</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { optionsTaskType, optionsCycle, optionsWeek } from '@/utils/constant'
import { getExecutor } from '@/api/user'
import { getProjectEnv } from '@/api/project'

export default {
  name: 'TimedTask',
  props: {
    taskData: {
      type: [Object, Array],
      default() {
        return {}
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      optionsTaskType,
      optionsCycle,
      optionsWeek,
      form: {
        server_id: null,
        executive_machine: null,
        trigger: null,
        date_type: null,
        day_of_week: [],
        day: null,
        run_time: null
      },
      serverList: [],
      executorList: [],
      loading: false
    }
  },
  watch: {
    taskData(value) {
      const { data } = value
      const {
        server_id,
        executive_machine,
        trigger,
        date_type,
        day_of_week = [],
        day,
        run_time,
        run_date
      } = data
      this.form = {
        server_id,
        executive_machine,
        trigger,
        date_type,
        day_of_week,
        day,
        run_time,
        run_date
      }
    }
  },
  created() {
    this.getProjectEnvList()
    this.getExecutorList()
  },
  methods: {
    updateVisible(value) {
      this.$emit('update:visible', value)
    },
    handleSubmit() {
      if (this.loading) return
      this.loading = true
      this.$emit('submit', this.getSubmitForm(this.form), (promise) => {
        promise.finally(() => {
          this.loading = false
        })
      })
    },
    getSubmitForm(form) {
      const r = {
        interface_id: this.taskData.interfaceId
      }
      for (const key in form) {
        const value = form[key]
        if (value == null) continue
        switch (key) {
          case 'day_of_week':
            value.length && (r[key] = value.join(','))
            break
          case 'run_time':
            var [hour, minute] = value.split(':')
            r['hour'] = +hour
            r['minute'] = +minute
            break
          default:
            r[key] = value
        }
      }
      return r
    },
    getExecutorList() {
      getExecutor().then(({ data }) => {
        this.executorList = data
      })
    },
    getProjectEnvList() {
      getProjectEnv({
        project: this.$store.getters.selectedProjectId
      }).then(({ data }) => {
        this.serverList = data
      })
    }
  }
}
</script>
