<template>
  <!--单例模式，name相同则复用一个无界实例，改变url则子应用重新渲染实例到对应路由, sync 改为 true 则会切换到缓存模式，但是路由会出问题 -->
  <WujieVue width="100%" height="100%" name="vite" :url="viteUrl" :sync="true"></WujieVue>
</template>

<script lang="ts">

export default {
  data() {
    return {
      viteUrl: "http://localhost:3010/",
    };
  },
};
</script>

<style lang="scss" scoped></style>
