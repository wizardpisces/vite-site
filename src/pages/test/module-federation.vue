<template>
  <div class="test-federation">
     this is federation
    <div v-html="remoteDemo"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import ReactDOMServer from "react-dom/server";

export default defineComponent({
  async setup() {
    // @ts-ignore
    const Demo = await import("remote-sub-app/Demo");
    // console.log('Demo', Demo.default())
    // 丢失了方法，因为是 renderToString 需要激活才行
    console.log('Demo', Demo.default({onClick:()=>{console.log('from vue test federation click')}}))
    return {
      remoteDemo: ReactDOMServer.renderToString(Demo.default()),
    };
  },
});
</script>
