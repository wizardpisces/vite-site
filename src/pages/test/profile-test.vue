<template>
  <div class="test">
    cpu profiling test:
    <v3-button @click="onProfileClick"> cpu profiling： {{bigTaskRunedTimes}}
    </v3-button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import useCpuProfile from "./composition/use-cpu-profile";

export default defineComponent({
  setup() {
    const { onProfileClick, bigTaskRunedTimes } = useCpuProfile();

    return {
      onProfileClick,
      bigTaskRunedTimes,
    };
  },
});
</script>
