<template>
  <div id="irises">
    <h1>irises prediction by petal and sepal</h1>
    <h2>single sample</h2>
    <sample-desc
      v-show="singleResult.gotType > -1"
      :singleResult="singleResult"
    ></sample-desc>

    <h2>full sample</h2>
    <div v-show="rightTestCases.length">
      <span
        >right test cases percent:
        {{ rightTestCases.length / fullSampleArray.length }}</span
      >
      <sample-desc
        v-for="(sample, index) in fullSampleArray"
        :key="index"
        :singleResult="sample"
      ></sample-desc>
    </div>
  </div>
</template>
<script lang="ts">
import SampleDesc from "./sample-desc.vue";
import "./worker-demo/main";
// import { useSerialTestIrises } from "./hooks/serial";
import { useConcurrentIrisesTest } from "./hooks/concurrent";

export default {
  components: { SampleDesc },
  setup() {
    let isConcurrent = true;
    let result;

    // if(isConcurrent){
    result = useConcurrentIrisesTest();
    // }else{
    //   result = useSerialTestIrises()
    // }

    return {
      singleResult: result.singleResult,
      fullSampleArray: result.fullSampleArray,
      rightTestCases: result.rightTestCases,
    };
  },
};
</script>
