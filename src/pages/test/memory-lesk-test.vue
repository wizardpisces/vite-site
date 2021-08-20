<template>
  <div class="test">
    memory-leak test:
    <v3-button @click="onMemoryLeakStart"> {{count}}
    </v3-button>
  </div>
</template>
<script lang="ts">
import { ref } from "@vue/reactivity";
import { defineComponent } from "vue";
import { createBigObj } from "./composition/use-cpu-profile";

let bigObj = createBigObj(100000);
  // @ts-ignore
window.leakFn = () => {
  let big = bigObj
};
export default defineComponent({
  setup() {
    let count = ref(0);
    let leakFlag = false;
    function onMemoryLeakStart() {
      leakFlag = !leakFlag;

      if(leakFlag){
        console.log('start')
      }else{
        console.log('stop')
      }
      
      setInterval(() => {
        if (count.value >= 100000 || !leakFlag) return;
        function wrapLeakFn() {
          count.value++;
          // console.log('start')
          // if (false) {
          //   // @ts-ignore
          //   let pointer = window.leakFn();
          // }
        }
        let tempFn = wrapLeakFn;
        tempFn();
      }, 1);
    }
    return {
      onMemoryLeakStart,
      count,
    };
  },
});
</script>
