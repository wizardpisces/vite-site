<template>
  <div>
    <h1>{{ msg }}</h1>
    <klk-button
      size='small'
      @click="add"
    >count is: {{ count }}</klk-button>
    <klk-button
      size='small'
      @click="incGaModuleCount"
    >store count is: {{ storeCount }}
    </klk-button>
    <klk-button @click="onProfileClick"> cpu profiling： {{bigTaskRunedTimes}}
    </klk-button>
    <router-view />
  </div>
</template>

<script lang='ts'>
import useCounter from "./composition/use-counter";
import useTest from "./composition/use-test";
import { useStore } from "../../store";
import { computed } from "vue";

export default {
  name: "Test",
  props: {
    msg: String,
  },
  setup(props) {
    const { add, count } = useCounter(props.msg as string);
    const {onProfileClick,bigTaskRunedTimes} = useTest()
  
    const store = useStore();

    return {
      onProfileClick,
      bigTaskRunedTimes,
      add,
      count,
      incGaModuleCount: () => store.commit("gaModule/increment"),
      storeCount: computed(() => store.getters["gaModule/count"]),
    };
  },
};
</script>
