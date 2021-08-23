<template>
    <div class="test">
        vuex@4 with vue@3 example:
        <v3-button
            size='small'
            @click="incGaModuleCount"
        >store count is: {{ storeCount }}
        </v3-button>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "../../store";
import { computed } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();

    return {
      storeCount: computed(() => store.getters["gaModule/count"]),
      incGaModuleCount: () => store.commit("gaModule/increment"),
    };
  },
});
</script>
