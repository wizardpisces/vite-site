<template>
  <div class="test-typescript-json-schema">
    <h1>typescript-json-schema</h1>
    See readme
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {getTestData}  from './api/test'
export default defineComponent({
  props: {
    msg: String,
  },
  setup(props) {
    getTestData()
    return {
        
    }
  },
});
</script>
