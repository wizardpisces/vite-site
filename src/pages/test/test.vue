<template>
  <div>
    <h1>{{ msg }}</h1>
    <v3-button
      size='small'
      @click="add"
    >count is: {{ count }}</v3-button>
    <v3-button
      size='small'
      @click="incGaModuleCount"
    >store count is: {{ storeCount }}
    </v3-button>
    <v3-button @click="onProfileClick"> cpu profiling： {{bigTaskRunedTimes}}
    </v3-button>
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
