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
    >store count is: {{ storeCount }}</klk-button>
    <router-view />
  </div>
</template>

<script lang='ts'>
import useCounter from "./composition/use-counter";
import { useStore } from "../../store";
import { computed } from 'vue';

export default {
  name: "Menu",
  props: {
    msg: String,
  },
  setup(props) {
    const { add, count } = useCounter(props.msg as string);
    const store = useStore();

    return {
      add,
      count,
      incGaModuleCount:()=>store.commit("gaModule/increment"),
      storeCount:computed(()=>store.getters['gaModule/count'])
    };
  },
};
</script>
