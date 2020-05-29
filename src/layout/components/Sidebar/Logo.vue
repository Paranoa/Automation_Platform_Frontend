<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <!-- <img src="@/assets/logo.png" class="logo"> -->
        <div class="logo">LOGO</div>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <!-- <img src="@/assets/logo.png" class="logo"> -->
        <div class="logo">LOGO</div>
        <h1 class="sidebar-title">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: '接口测试平台'
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
    padding: 25px 0;
    background-image: linear-gradient(0deg, #2B618E 0%, rgba(47,129,199,0.90) 100%);
    text-align: center;
  & .sidebar-logo-link {
    .logo {
      width: 180px;
      height: 52.4px
    }
    .sidebar-title {
      color: #fff;
      font-size: 19px;
      // todo delete
      transform: translateY(-23px);
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
