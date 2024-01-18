<template>
  <div class="sub-app-react">
    <div id="subAppReact"></div>
  </div>
</template>

<script>
import { registerMicroApps, start } from "qiankun";
window.qiankunInited = false;
export default {
  mounted() {
    if (!window.qiankunInited) {
      console.log(
        "-------mount sub react-----NODE_ENV: ",
        process.env.NODE_ENV
      );
      window.qiankunInited = true;
      registerMicroApps([
        {
          name: "appReact",
          entry:
            process.env.NODE_ENV === "development"
              ? `//localhost:3001/?_t=${new Date().getTime()}`
              : `${
                  window.location.origin
                }/app-react/?_t=${new Date().getTime()}`,
          container: "#subAppReact",
          // activeRule: (location) => location.pathname.includes("/app-react"),
          activeRule: "/app-react",
        },
      ]);
      // start({
      //   sandbox: false,
      // });
      start();
    }
  },
};
</script>

<style lang="scss"></style>
