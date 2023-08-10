<template>
  <div class="sample-desc">
    <span>
      {{ genSampleDesc(singleResult.input) }} ; expected:
      {{ singleResult.expectedType }} ,got: {{ singleResult.gotType }}
      {{ labelMap[singleResult.gotType] }}
    </span>
    <span
      :class="
        singleResult.expectedType === singleResult.gotType ? 'green' : 'red'
      "
    >
      [{{
        singleResult.expectedType === singleResult.gotType ? "right" : "wrong"
      }}]
    </span>
  </div>
</template>
<script lang="ts">
import Vue, { PropType } from "vue";
import { SampleType } from "./type";
import { genSampleDesc } from "./util";

let defaultSingleResult: SampleType = {
  input: [],
  expectedType: -1,
  gotType: -1,
};

export default {
  props: {
    singleResult: {
    //   type: Object as PropType<SampleType>,
        default:defaultSingleResult
    },
  },
  setup(props) {
    const labelMap = {
      0: "Iris-setosa",
      1: "Iris-versicolor",
      2: "Iris-virginica",
    };
    // console.log(props.singleResult)
    return {
      singleResult: props.singleResult,
      labelMap,
      genSampleDesc,
    };
  },
};
</script>
<style scoped>
.red {
  color: red;
}
.green {
  color: green;
}
</style>
