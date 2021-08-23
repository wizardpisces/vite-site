<template>
  <div class="test">
    composition api example:
    <v3-button
      size='small'
      @click="add"
    >count is: {{ count }}</v3-button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import useCounter from "./composition/use-counter";
export default defineComponent({
  props: {
    msg: String,
  },
  setup(props) {
    const { add, count } = useCounter(props.msg as string);
    return {
      add,
      count,
    };
  },
});
</script>
