<template>
  <div class="canvas-paint">
    <h1>Drawing Board</h1>
    <div class="toolbar">
      <v3-button @click="download">Download</v3-button>
      <v3-button @click="clear">Clear</v3-button>
      <v3-button @click="undo">Undo</v3-button>
      <v3-button @click="redo">Redo</v3-button>
      <label>Color:</label>
      <input type="color" v-model="color" />
      <label>Thickness:</label>
      <input type="range" min="1" max="10" v-model="width" />
    </div>
    <div class="canvas-wrapper">
      <canvas
        ref="canvas"
        @mousedown="startDraw"
        @mousemove="draw"
        @mouseup="endDraw"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "CanvasPaint",
  setup() {
    // 定义一些响应式变量
    const canvas = ref<HTMLCanvasElement | null>(null); // canvas 元素的引用
    const context = ref<CanvasRenderingContext2D | null>(null); // canvas 的绘图上下文
    const color = ref("#000000"); // 画笔颜色
    const width = ref(5); // 画笔粗细
    const drawing = ref(false); // 是否正在绘制
    const history = ref<ImageData[]>([]); // 历史记录，用于撤销和重做
    const index = ref(-1); // 历史记录的索引

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

    const startDraw = (e: MouseEvent) => {
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
      context.value.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e: MouseEvent) => {
      if (
        context.value === null ||
        canvas.value === null ||
        canvas.value.parentElement === null
      ) {
        return;
      }
      // 绘制过程，如果正在绘制，就获取鼠标位置，并将其作为终点，然后绘制一条线段，并更新起点
      if (drawing.value) {
        context.value.lineTo(e.offsetX, e.offsetY);
        context.value.stroke();
        context.value.moveTo(e.offsetX, e.offsetY);
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
  }

  .canvas-wrapper {
    display: inline-flex;
    justify-content: flex-end;
    margin: 10px 0;
    border: 15px solid #94b4cb;
    transition: border-color 0.2s ease-in;
    width: 500px;
    height: 500px;
    &:hover {
      border-color: #2a6a96;
    }
  }

  canvas {
    display: block;
  }
}
</style>
