<template>
  <div class="user-manage-container">
    <div v-if="project" class="user-manage-info">
      <div class="row">
        <span :span="3">
          <label>项目名称： </label>
          <span>{{ project.name }}</span>
        </span>
        <span :span="4">
          <label>项目开始时间：</label>
          <span>{{ project.start_time | parseToDate }}</span>
        </span>
        <span :span="4">
          <label> 项目结束时间：</label>
          <span>{{ project.end_time | parseToDate }}</span>
        </span>
        <span :span="4">
          <label>项目优先级： </label>
          <span>{{ project.level | projectLevel }}</span>
        </span>
        <span :span="2">
          <label>负责人： </label>
          <span>{{ project.username }}</span>
        </span>
      </div>
      <div class="user-content">
        <div>
          <div class="user-content-label">所有人员</div>
          <div class="user-content-box">
            <div
              v-for="user of userListSorted"
              :key="user.id"
              :class="{ 'active': currUser === user }"
              class="user-item"
              @click="currUser = user; currSelectedUser = null"
            >{{ user.username }}</div>
          </div>
        </div>
        <div class="aside-arrow">
          <!-- <span class="btn-round add" @click="addToSelected">+</span>
            <span class="btn-round delete" style="" @click="removeFromSelected">_</span> -->
          <span class="el-icon-circle-plus" @click="addToSelected" />
          <span class="el-icon-remove" style="" @click="removeFromSelected" />
        </div>
        <div>
          <div class="user-content-label">项目人员</div>
          <div class="user-content-box">
            <div
              v-for="user of selectedUserList"
              :key="user.id"
              :class="{ 'active': currSelectedUser === user }"
              class="user-item"
              @click="currSelectedUser = user; currUser = null"
            >{{ user.username }}</div>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <span class="app-btn app-btn-blue" type="primary" @click="handleConfirm">保 存</span>
      <span class="app-btn app-btn-white" @click="handleCancel">返 回</span>
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userList: this.$store.getters.allUsers,
      currUser: null,
      selectedUserList: [],
      currSelectedUser: null
    }
  },
  computed: {
    project() {
      return this.$route.params.project
    },
    userListSorted() {
      return [...this.userList].sort((a, b) => a.id - b.id)
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
      this.$router.go(-1)
    },
    handleConfirm() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-manage-container {
  min-height: 100vh;
  padding: 40px 30px 90px;
  .user-manage-info {
    .row {
      >span {
        margin-right: 90px;
        label {
          font-weight: normal;
          margin-right: 20px;
        }
      }
    }
    .user-content {
      display: flex;
      margin-top: 50px;
      > div {
        width: 40%;
        display: flex;
        &.aside-arrow {
          width: 10%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          padding-left: 110px;
          >span {
            color: #0090DA;
            font-size: 35px;
            cursor: pointer;
          }
        }
        .user-content-label {
          width: 100px;
        }
        .user-content-box {
          width: 540px;
          height: 400px;
          overflow: auto;
          border: 1px solid #333;
          border-radius: 4px;
          background: #fff;
          margin-top: -15px;
          .user-item {
            line-height: 40px;
            padding-left: 10px;
            cursor: pointer;
            &.active {
              background: rgba(204, 238, 236, .5)
            }
            &:hover {
              background: rgba(0, 144, 218, .1)
            }
          }
        }
      }
    }
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
