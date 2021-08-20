<template>
  <div class="virtual-machine">
    <div class="source-code">
      <h3>Instructions</h3>
      <textarea
        v-model="code"
        type="text"
      >
        </textarea>
    </div>
    <div class="machine-code">
      <h3>machine code</h3>
      <textarea
        v-model="machineCode"
        type="text"
      >
        </textarea>
      <v3-button @click="onAssembleClick">assemble</v3-button>
    </div>
    <div class="result">
      <h3>instruction result</h3>
      <textarea
        v-model="result"
        type="text"
      >
        </textarea>
      <v3-button @click="onRunClick">run</v3-button>

    </div>
  </div>
</template>

<script type="ts">
import { ref } from 'vue';

import { code, run, assemble } from '../../vm/code'
export default {
  name: 'VirtualMachine',
  setup() {
    let machineCode = ref(''), result = ref('')
    function onAssembleClick() {
      machineCode.value = assemble(code)
    }
    function onRunClick() {
      result.value = run(machineCode.value)
    }
    return {
      code,
      onAssembleClick,
      onRunClick,
      machineCode,
      result
    }
  }
}
</script>
<style lang="scss" scoped>
.virtual-machine {
  display: flex;
  width: 100%;
  height: 600px;
  .source-code,
  .machine-code,
  .result {
    display: flex;
    flex-direction: column;
    flex: 1;
    border-right: 1px solid red;
    padding: 20px;
    font-size: 12px;
    .v3-button {
      width: 100px;
    }
    textarea {
      line-height: 16px;
      width: 280px;
      height: 500px;
    }
  }
}
</style>