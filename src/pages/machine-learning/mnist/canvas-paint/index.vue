<template>
  <div class="canvas-paint">
    <h1>Drawing Board</h1>
    <div class="toolbar">
      <div class="action">
        <!-- <button @click="download">Download</button> -->
        <button @click="clear">Clear</button>
        <!-- <button @click="undo">Undo</button> -->
        <!-- <button @click="redo">Redo</button> -->
      </div>
      <div class="action">
        <span>Color: </span>
        <input type="color" v-model="color" />
      </div>
      <div class="action">
        <span>Thickness: </span>
        <input type="range" min="1" max="10" v-model="width" />
      </div>

    </div>
    <div class="canvas-output-wrapper">
      <div class="canvas-wrapper">
        <canvas ref="canvas" @mousedown="startDraw" @mousemove="draw" @mouseup="endDraw" @touchstart="startDraw"
        @touchmove="draw" @touchend="endDraw"></canvas>
      </div>
  
      <div class="output-column">
        <ul class="output">
          <li
            class="output-class"
            :class="{ predicted: i === predictedClass }"
            v-for="i in outputClasses"
            :key="`output-class-${output[i]}`"
          >
            <span class="output-label">{{ i }}</span>
            <span
              class="output-bar"
              :style="{ width: `${Math.round(180 * output[i])}px` }"
            ></span>
          </li>
        </ul>
      </div>
    </div>
    
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, onBeforeMount, defineProps, PropType, computed } from "vue";

import { runModelUtils,mathUtils, getPredictedClass } from "../../utils";
import { InferenceSession, Tensor } from "onnxruntime-web";

// 微软的模型，难道不包含 LogSoftmax 操作？
const modelUrl = new URL("./mnist.onnx", import.meta.url).href

// 自己训练的模型：报错 TypeError: cannot resolve operator 'LogSoftmax' with opsets: ai.onnx v10
// const modelUrl = new URL("../mnist.onnx", import.meta.url).href

export default {
  name: "CanvasPaint",
  props: {
    preprocess: {
      type: Function as PropType<(ctx: CanvasRenderingContext2D) => Tensor>,
      required: true,
    },
    postprocess: {
      type: Function as PropType<(rawOutput: Tensor) => Float32Array>,
      required: true,
    }
  },
  setup(props) {
    // 定义一些响应式变量
    const canvas = ref<HTMLCanvasElement | null>(null); // canvas 元素的引用
    const context = ref<CanvasRenderingContext2D | null>(null); // canvas 的绘图上下文
    const color = ref("#000000"); // 画笔颜色
    const width = ref(5); // 画笔粗细
    const drawing = ref(false); // 是否正在绘制
    const history = ref<ImageData[]>([]); // 历史记录，用于撤销和重做
    const index = ref(-1); // 历史记录的索引

    const session = ref<InferenceSession | null>(null);
    const sessionRunning = ref(false); // 是否正在运行模型
    const inferenceTime = ref(0);
    const output = ref<Float32Array>(new Float32Array(10));
    const outputClasses:number[] = [0,1,2,3,4,5,6,7,8,9];

    const initSession = async () => {
        // init session
      session.value = await InferenceSession.create(
        modelUrl,
        {
          executionProviders: ["webgl"],
        }
      )
      runModelUtils.warmupModel(session.value, [1, 1, 28, 28]);
    }

    onBeforeMount(async () => {
      initSession()
    });

    const runModelTest = async () => {
       if (
        context.value === null||
        drawing.value||
        sessionRunning.value
      ) {
        return;
      }
      if(session.value === null){
        await initSession()
      }

      console.log("start mnist model test")
      drawing.value = false;
      sessionRunning.value = true;
      const tensor = props.preprocess(context.value);
      const [res, time] = await runModelUtils.runModel(session.value as InferenceSession, tensor);
      output.value = props.postprocess(res);
      console.log("end mnist model test", time,output.value)
      
      inferenceTime.value = time;
      sessionRunning.value = false;
    }

    // 定义一些生命周期钩子函数
    onMounted(() => {
      // 挂载组件后，获取 canvas 元素和绘图上下文
      canvas.value = document.querySelector("canvas") as HTMLCanvasElement;
      context.value = canvas.value.getContext("2d");
      // 设置 canvas 的宽度和高度为父元素的宽度和高度
      canvas.value.width = (
        canvas.value.parentElement as HTMLElement
      ).clientWidth;
      canvas.value.height = (
        canvas.value.parentElement as HTMLElement
      ).clientHeight;
      // 添加窗口大小变化的监听事件，调整 canvas 的大小
      window.addEventListener("resize", resizeCanvas);
    });

    onUnmounted(() => {
      // 卸载组件前，移除窗口大小变化的监听事件
      window.removeEventListener("resize", resizeCanvas);
    });

    // 定义一些自定义函数
    const resizeCanvas = () => {
      if (
        context.value === null ||
        canvas.value === null ||
        canvas.value.parentElement === null
      ) {
        return;
      }

      // 调整 canvas 的大小为父元素的宽度和高度，并保留原来的内容
      const imageData = context.value.getImageData(
        0,
        0,
        canvas.value.width,
        canvas.value.height
      );
      canvas.value.width = canvas.value.parentElement.clientWidth;
      canvas.value.height = canvas.value.parentElement.clientHeight;
      context.value.putImageData(imageData, 0, 0);
    };

    const startDraw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (
        context.value === null ||
        canvas.value === null ||
        canvas.value.parentElement === null
      ) {
        return;
      }
      // 开始绘制，设置画笔颜色和粗细，获取鼠标位置，并将其作为起点
      drawing.value = true;
      context.value.strokeStyle = color.value;
      context.value.lineWidth = width.value;
      context.value.beginPath();
      const coordinates = mathUtils.getCoordinates(e)
      context.value.moveTo(coordinates[0], coordinates[1]);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (
        context.value === null ||
        canvas.value === null ||
        canvas.value.parentElement === null
      ) {
        return;
      }
      // 绘制过程，如果正在绘制，就获取鼠标位置，并将其作为终点，然后绘制一条线段，并更新起点
      if (drawing.value) {
        const coordinates = mathUtils.getCoordinates(e)
        context.value.lineTo(coordinates[0], coordinates[1]);
        context.value.stroke();
        context.value.moveTo(coordinates[0], coordinates[1]);
      }
    };

    const endDraw = () => {
      if (context.value === null || canvas.value === null) {
        return;
      }
      // 结束绘制，关闭路径，并将当前的图像数据保存到历史记录中，更新索引
      drawing.value = false;
      context.value.closePath();
      history.value.push(
        context.value.getImageData(
          0,
          0,
          canvas.value.width,
          canvas.value.height
        )
      );
      index.value++;
      runModelTest()
    };

    const clear = () => {
      if (context.value === null || canvas.value === null) {
        return;
      }
      // 清空画板，使用白色填充整个画布，并清空历史记录和索引
      context.value.fillStyle = "#ffffff";
      context.value.fillRect(0, 0, canvas.value.width, canvas.value.height);
      history.value = [];
      index.value = -1;
    };

    const undo = () => {
      if (context.value === null) {
        return;
      }
      // 撤销操作，如果历史记录不为空，就将索引减一，并将对应的图像数据恢复到画布上
      if (history.value.length > 0) {
        index.value--;
        context.value.putImageData(history.value[index.value], 0, 0);
      }
    };

    const redo = () => {
      if (
        context.value === null
      ) {
        return;
      }
      // 重做操作，如果索引没有达到历史记录的最大值，就将索引加一，并将对应的图像数据恢复到画布上
      if (index.value < history.value.length - 1) {
        index.value++;
        context.value.putImageData(history.value[index.value], 0, 0);
      }
    };

    //下载图片
    const download = () => {
      if (
        context.value === null ||
        canvas.value === null ||
        canvas.value.parentElement === null
      ) {
        return;
      }
      var url = canvas.value.toDataURL("image/png");
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "我的画板.png";
      a.target = "_blank";
      a.click();
    };

    const predictedClass = computed(()=> getPredictedClass(output.value))

    // 返回一些响应式变量和自定义函数，供模板使用
    return {
      canvas,
      color,
      width,
      clear,
      undo,
      redo,
      startDraw,
      draw,
      endDraw,
      download,
      outputClasses,
      output,
      predictedClass
    };
  },
};
</script>

<style lang="scss">
/* 设置一些样式 */
.canvas-paint {
  max-width: 1000px;
  .toolbar {
    display: flex;
    align-items: center;

    .action {
      display: flex;
      margin: 0 10px;
      align-items: center;
    }
  }

  .canvas-output-wrapper{
    display: flex;

  }

  .canvas-wrapper {
    display: inline-flex;
    justify-content: flex-end;
    margin: 10px 0;
    border: 15px solid #94b4cb;
    transition: border-color 0.2s ease-in;
    width: 300px;
    height: 300px;

    &:hover {
      border-color: #2a6a96;
    }
  }

  canvas {
    display: block;
  }
  .output-column{
    .output{
      display: flex;
      flex-direction: column;
      .output-bar{
        display: inline-block;
        height: 10px;
        background-color: #2a6a96;
      }
    }

  }
}

@media (max-width: 719px) {
  .canvas-paint {
    max-width: 500px;
    flex-direction: column;
    .toolbar {
      display: flex;
      flex-direction: column;
      align-items: baseline;

      .action {
        margin: 10px 0;
      }
    }

    .canvas-wrapper {
      width: 300px;
      height: 300px;
    }
  }
}
</style>
