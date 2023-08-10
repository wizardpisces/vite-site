<template>
  <div id="irises">
    <h1>irises prediction by petal and sepal</h1>
    <h2>single sample</h2>
    <sample-desc
      v-show="singleResult.gotType > -1"
      :singleResult="singleResult"
    ></sample-desc>

    <h2>full sample</h2>
    <div v-show="rightTestCases.length">
      <span
        >right test cases percent:
        {{ rightTestCases.length / fullSampleArray.length }}</span
      >
      <sample-desc
        v-for="(sample, index) in fullSampleArray"
        :key="index"
        :singleResult="sample"
      ></sample-desc>
    </div>
  </div>
</template>
<script lang="ts">
import { reactive, ref } from "vue";
import { Tensor, InferenceSession } from "onnxjs";
import irisesSample from "./irises_dataset.json";
import { SampleType } from "./type";
import { features } from "./util";
import SampleDesc from "./sample-desc.vue";

const url = "./onnx/irises.onnx";
const session = new InferenceSession();

export default {
  components: { SampleDesc },
  setup() {
    const singleSampleLabelDataMap = {
      2: [6.3, 3.3, 6.0, 2.5],
      1: [5.7, 2.6, 3.5, 1.0],
      0: [5.1, 3.5, 1.4, 0.2],
    };
    const singleSampleType = 1;
    const singleInput = singleSampleLabelDataMap[singleSampleType];

    let rightTestCases = ref<SampleType[]>([]);
    let singleResult = reactive<SampleType>({
      input: singleInput,
      expectedType: singleSampleType,
      gotType: -1,
    });
    function testSingleIrises(irisInfo: SampleType) {
      // console.log("irisInfo", irisInfo.input);
      // Convert Iris species into numeric types: Iris-setosa=0, Iris-versicolor=1, Iris-virginica=2.
      // creating an array of input Tensors is the easiest way. For other options see the API documentation
      const inputs = [
        new Tensor(new Float32Array(irisInfo.input), "float32", [1, 4]),
      ];

      let outputTensor = [0, 0, 0];
      // run this in an async method:

      return session.run(inputs).then((outputMap) => {
        let mostLikely = 0;
        outputTensor = outputMap.values().next().value.data;
        // console.log("outputTensor", outputTensor);
        outputTensor.forEach((item, index) => {
          if (item > mostLikely) {
            mostLikely = item;
            irisInfo.gotType = index;
          }
        });
      });
    }

    let fullSampleArray = ref<SampleType[]>([]);
    function testFullSample() {
      // console.log("fullSampleArray.value", fullSampleArray.value);
      for (const [key, sample] of Object.entries(irisesSample)) {
        fullSampleArray.value.push({
          input: features.map((feature) => sample[feature]),
          expectedType: sample["IrisType_num"],
          gotType: -1,
        });
      }

      const r = Promise.resolve();
      function exec(index, cb) {
        if (index < fullSampleArray.value.length) {
          testSingleIrises(fullSampleArray.value[index]).then(() => {
            exec(index + 1, cb);
          });
        } else {
          cb();
        }
      }

      console.log("Test start");
      exec(0, () => {
        rightTestCases.value = fullSampleArray.value.filter(
          (sample) => sample.gotType === sample.expectedType
        );
        console.log("Test finished!!!");
      });
    }

    session.loadModel(url).then(() => {
      console.log("model loaded");
      testSingleIrises(singleResult).then((_) => {
        testFullSample();
      });
    });

    return {
      singleResult,
      fullSampleArray,
      rightTestCases,
    };
  },
};
</script>
