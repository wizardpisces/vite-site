// worker
// import { Tensor, InferenceSession } from "onnxjs";
import { Tensor, InferenceSession } from "onnxruntime-web";
import { SampleType } from "../type";
import { features } from "../util";

const url = new URL("../onnx/irises.onnx", import.meta.url).href
// const url = "../onnx/irises.onnx";

let rightTestCases: SampleType[] = [];

export async function computeIrises(irisesSample:{ [key: string]: SampleType}) { // 参照 Irises_dataset.json 的数据结构
    let _resolve
    let p = new Promise((resolve, reject) => {
        _resolve = resolve
    })
    const session = await InferenceSession.create(
        url,
        {
            executionProviders: ["webgl"],
        }
    )

    function testSingleIrises(irisInfo: SampleType) {
        // Convert Iris species into numeric types: Iris-setosa=0, Iris-versicolor=1, Iris-virginica=2.
        // creating an array of input Tensors is the easiest way. For other options see the API documentation
        const inputs = new Tensor("float32",new Float32Array(irisInfo.input), [1, 4])

        // let outputTensor: Float32Array = new Float32Array([0,0,0]);
        // run this in an async method:

        return session.run({input:inputs},['output']).then((outputMap) => {
            let mostLikely = 0;
            let outputTensor = outputMap.output.data;
            outputTensor.forEach((item, index) => {
                if (item > mostLikely) {
                    mostLikely = item;
                    irisInfo.gotType = index;
                }
            });
        });
    }

    let fullSampleArray: SampleType[] = [];
    function testFullSample() {
        for (const [key, sample] of Object.entries(irisesSample)) {
            fullSampleArray.push({
                input: features.map((feature) => sample[feature]),
                expectedType: sample["IrisType_num"],
                gotType: -1,
            });
        }

        function exec(index, cb) {
            if (index < fullSampleArray.length) {
                testSingleIrises(fullSampleArray[index]).then(() => {
                    exec(index + 1, cb);
                });
            } else {
                cb();
            }
        }

        exec(0, () => {
            rightTestCases = fullSampleArray.filter(
                (sample) => sample.gotType === sample.expectedType
            );

            _resolve({
                rightTestCases,
                fullSampleArray
            })
        });
    }

    console.log("model loaded");
    testFullSample();

    return p
}

// 监听主线程发送的数据
self.onmessage = function (e) {
    // console.log('worker received msg', e.data);
    // 调用计算函数，并将结果返回给主线程
    computeIrises(e.data).then((res) => {
        self.postMessage(res);
    })
};
