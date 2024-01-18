<template>
  <div>
    <h1>micro app 子应用👇，子应用是 vite 场景下需要把 micro-app 切换到 iframe 模式</h1>
    <!-- name：应用名称, url：应用地址 -->
    <micro-app name='my-app' url='http://localhost:3001/' baseroute='/app-react/' disable-memory-router iframe></micro-app>
  </div>
</template>

<script lang="ts">
export default {
  name: "micro",
  mounted() {
    console.log("-------mount micro-----NODE_ENV: ", process.env.NODE_ENV);
    return {
      // @ts-ignore
      subUrl: import.meta.env.DEV ? "http://localhost:3001/" : ""
    }
  }
};
</script>