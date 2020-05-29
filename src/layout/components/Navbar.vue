<template>
  <div class="navbar">
    <div class="right-menu">
      <span>欢迎您 {{ userInfo.username }}</span>
      <el-popover
        placement="bottom"
        width="150"
        trigger="hover"
      >
        <div
          class="popover-item"
          @click="logout"
        >
          登出
        </div>
        <span slot="reference">
          <svg-icon icon-class="profile" class="svg-profile" />
        </span>
      </el-popover>
      <span class="lan">EN</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  overflow: hidden;
  position: relative;
  padding: 10px 0;
  background: #F2F2F2;

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    padding-right: 30px;
    font-size: 17px;
    color: #333;
    display: flex;
    width: 226px;
    justify-content: space-between;

    .svg-profile {
      cursor: pointer;
      font-size: 15px;
    }

    .lan {
      font-size: 12px;
    }
  }
}

.popover-item {
  padding: 5px 10px;
  cursor: pointer;
  &:hover {
    background: #f8f8f8
  }
}
</style>
