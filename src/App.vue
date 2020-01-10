<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
     // TODO move this dispatch to login
    this.$store.dispatch('user/getAllUsers')
    this.$store.dispatch('project/getAllProjects')
  }
}
</script>
