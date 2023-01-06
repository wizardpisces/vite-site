<template>
  <div id="test-container">
    <h1>{{ msg }}</h1>
    <composition-test msg="basic composition"></composition-test>
    <vuex-test></vuex-test>
    <profile-test></profile-test>
    <memory-leak-test></memory-leak-test>
    <toggle-translate-key></toggle-translate-key>
    <router-view />
  </div>
</template>

<script lang='ts'>
import VuexTest from "./vuex-test.vue";
import CompositionTest from "./composition-test.vue";
import ProfileTest from "./profile-test.vue";
import MemoryLeakTest from "./memory-lesk-test.vue";
import ToggleTranslateKey from './toggle-translate-key.vue'
export default {
  name: "TestContainer",
  components: {
    VuexTest,
    CompositionTest,
    ProfileTest,
    MemoryLeakTest,
    ToggleTranslateKey
  }
};
</script>
<style lang="scss" scoped>
#test-container{
  display: flex;
  .test{
    padding:20px
  }
}
</style>