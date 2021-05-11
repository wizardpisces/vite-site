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
    >count is: {{ storeCount }}</klk-button>
    <router-link to="/blog/vue-ssr">Vue ssr</router-link>
    <router-view />
  </div>
</template>

<script lang='ts'>
import useCounter from "./composition/use-counter";
import { useStore } from "../../store";
import { computed } from '@vue/runtime-core';

export default {
  name: "Menu",
  props: {
    msg: String,
  },
  setup(props) {
    const { add, count } = useCounter(props.msg as string);
    const store = useStore();
    function incGaModuleCount() {
      store.commit("gaModule/increment");
    }
    let storeCount = computed(()=>store.getters['gaModule/count'])

    return {
      add,
      count,
      incGaModuleCount,
      storeCount
    };
  },
};
</script>
