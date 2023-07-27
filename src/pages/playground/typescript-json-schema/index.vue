<template>
  <div class="test-typescript-json-schema">
    <h1>typescript-json-schema</h1>
    See readme
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { demo } from "./api-defense/demo";

export default defineComponent({
  props: {
    msg: String,
  },
  setup(props) {
    demo();
    return {};
  },
});
</script>
