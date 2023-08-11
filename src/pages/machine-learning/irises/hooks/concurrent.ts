import { ref } from "vue";
import irisesSample from "../irises_dataset.json";
import { SampleType } from "../type";

// 主线程

// 创建一个数组，存储需要计算的数据
var data = Object.keys(irisesSample);

// 创建一个数组，存储创建的worker对象
var workers: Worker[] = [];

// 创建一个变量，存储返回的结果
let rightTestCases = ref<SampleType[]>([]);
let fullSampleArray = ref<SampleType[]>([]);

// 获取系统支持的最大并行数
var maxWorkers = navigator.hardwareConcurrency || 4;
// let maxWorkers = 1

// 根据最大并行数和数据长度，确定每个worker需要处理的数据个数
var chunkSize = Math.ceil(data.length / maxWorkers);

let startTime = new Date().getTime()
// 定义一个函数，用于创建worker对象，并分配数据和监听事件

let finishedWorkers = 0;
console.log('concurrent Irises test start! workers:', maxWorkers)

let defaultSingleResult: SampleType = {
    input: [],
    expectedType: -1,
    gotType: -1,
};

function createWorker(dataChunk) {
    // 创建一个worker对象
    var worker = new Worker(new URL('./concurrent-worker', import.meta.url), { type: 'module' });
    // 将worker对象存入数组
    workers.push(worker);
    // 向worker发送数据
    worker.postMessage(dataChunk);
    // 监听worker返回的结果
    worker.onmessage = function (e) {
        
        finishedWorkers++
        // 将结果存入数组
        rightTestCases.value = rightTestCases.value.concat(e.data.rightTestCases)
        fullSampleArray.value = fullSampleArray.value.concat(e.data.fullSampleArray)
        // 结束worker的运行
        worker.terminate();
        // 判断是否所有的结果都已返回
        if (finishedWorkers === workers.length) {
            // 对结果进行汇总和处理
            console.log('concurrent Irises test finished!', '; time cost', new Date().getTime() - startTime, 'ms');
        }
    };
}

export function useConcurrentIrisesTest() {

    // 遍历数据数组，按照每个worker需要处理的数据个数切分数据，并创建worker对象
    for (var i = 0; i < data.length; i += chunkSize) {
        createWorker(data.slice(i, i + chunkSize).reduce((prev, curKey) => {
            prev[curKey] = irisesSample[curKey];
            return prev;
        }, {}));
    }

    return {
        singleResult: defaultSingleResult,
        rightTestCases,
        fullSampleArray,
    };
}
