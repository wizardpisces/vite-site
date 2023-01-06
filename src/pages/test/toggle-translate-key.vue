<template>
  <div class="toggle-translate-key">
    <v3-button size="small" @click="toggleTranslateKey">{{
      t("toggleTranslateKey")
    }}</v3-button>
    <v3-button size="small" @click="add"
      >{{ t("add count") }} {{ count }}</v3-button
    >
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import { useI18N } from "../../utils/i18n";
import { key, useStore } from "../../store";
import { Mutations } from "../../store/type";

export default defineComponent({
  setup() {
    // const store = useStore()
    const store = inject(key)!;
    const { $t } = useI18N();

    let count = ref(0);
    const add = () => count.value++;
    return {
      toggleTranslateKey: () => store.commit(Mutations.TOGGLE_TRANSLATE_KEY),
      t: $t,
      count,
      add,
    };
  },
});
</script>
