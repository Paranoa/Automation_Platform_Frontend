<template>
  <el-dialog
    title="人员管理"
    :visible="visible"
    width="80%"
    class="user-manage-container"
    :before-close="handleCancel"
  >
    <div>
      <el-row>
        <el-col :span="6">
          项目编号：{{ project.id }}
        </el-col>
        <el-col :span="6">
          项目名称： {{ project.name }}
        </el-col>
        <el-col :span="6">
          项目开始时间：{{ project.start_time | parseToDate }}
        </el-col>
        <el-col :span="6">
          项目结束时间：{{ project.end_time | parseToDate }}
        </el-col>
      </el-row>
      <el-row style="margin-top: 20px;">
        <el-col :span="6">
          项目优先级： {{ project.level | projectLevel }}
        </el-col>
        <el-col :span="6">
          负责人： {{ project.username }}
        </el-col>
      </el-row>
      <div class="user-content">
        <div>
          <div class="user-content-label">所有人员</div>
          <div class="user-content-box">
            <div
              v-for="user of userListSorted"
              :key="user.id"
              :class="{ 'active': currUser === user }"
              class="user-item"
              @click="currUser = user"
            >{{ user.name }}</div>
          </div>
        </div>
        <div class="aside-arrow">
          <div>
            <el-button @click="addToSelected">添加</el-button>
            <el-button @click="removeFromSelected">删除</el-button>
          </div>
        </div>
        <div>
          <div class="user-content-label">项目人员</div>
          <div class="user-content-box">
            <div
              v-for="user of selectedUserList"
              :key="user.id"
              :class="{ 'active': currSelectedUser === user }"
              class="user-item"
              @click="currSelectedUser = user"
            >{{ user.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getAllUsers } from '@/api/user'
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    project: {
      type: Object,
      defualt() {
        return {}
      }
    }
  },
  data() {
    return {
      userList: this.$store.getters.allUsers,
      currUser: null,
      selectedUserList: [],
      currSelectedUser: null
    }
  },
  computed: {
    userListSorted() {
      return this.userList.sort((a, b) => a.id - b.id)
    }
  },
  methods: {
    addToSelected() {
      if (this.currUser) {
        const index = this.userList.findIndex(user => user === this.currUser)
        this.userList.splice(index, 1)
        this.selectedUserList.push(this.currUser)
        this.currUser = null
      }
    },
    removeFromSelected() {
      if (this.currSelectedUser) {
        const index = this.selectedUserList.findIndex(user => user === this.currSelectedUser)
        this.selectedUserList.splice(index, 1)
        this.userList.push(this.currSelectedUser)
        this.currSelectedUser = null
      }
    },
    handleCancel() {
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-manage-container {
  .user-content {
    display: flex;
    margin-top: 20px;
    > div {
      width: 40%;
      display: flex;
      &.aside-arrow {
        width: 20%;
      }
      .user-content-label {
        width: 100px;
      }
      .user-content-box {
        width: 200px;
        height: 250px;
        overflow: auto;
        border: 1px solid #eee;

        .user-item {
          border-bottom: 1px solid #eee;
          line-height: 30px;
          padding-left: 10px;

          &.active {
            background: #ddd
          }
          &:hover {
            background: #ddd
          }
        }
      }
    }
  }
}
</style>
