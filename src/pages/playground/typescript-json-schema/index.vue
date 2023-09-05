<template>
  <div class="test-typescript-json-schema">
    <h1>typescript-json-schema</h1>
    See console
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { apiSchemaAPI, apiDefenseAPI2 } from "./api-defense/__tests__/demo";

export default defineComponent({
  props: {
    msg: String,
  },
  setup(props) {
    const res = apiSchemaAPI();
    const res2 = apiDefenseAPI2();
    console.log('result successfully responded',res, res2);
    return {};
  },
});
</script>
