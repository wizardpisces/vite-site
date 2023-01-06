<template>
  <div class="toggle-translate-key">
        <button @click="toggleTranslateKey">{{t('toggleTranslateKey')}}</button>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useI18N } from "../../utils/i18n";
import { useStore } from "../../store";
import { Mutations } from "../../store/type";

export default defineComponent({
  setup() {
    const store = useStore()
    const {$t} = useI18N()
    return {
        toggleTranslateKey:()=>store.commit(Mutations.TOGGLE_TRANSLATE_KEY),
        t:$t
    };
  },
});
</script>
