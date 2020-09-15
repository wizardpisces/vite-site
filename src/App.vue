<template>
  <div id="app">
    <ul class="head-menu">
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/blog">blog</router-link></li>
    </ul>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>
<style lang="scss">
  #app{
    .head-menu{
      display: flex;
      flex-direction: row;
      margin: 5px 0;
      padding: 0;
      li{
        display: flex;
        padding:10px;
        &:first-child{
          padding-left: 0;
        }
      }
    }
  }
</style>
