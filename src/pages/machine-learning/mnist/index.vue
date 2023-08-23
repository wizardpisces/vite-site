<template>
    <div id="mnist">
        <a href="https://microsoft.github.io/onnxruntime-web-demo/#/mnist" target="_blank">MNIST demo</a>
        <CanvasPaint/>
    </div>
</template>
<script lang="ts">
import CanvasPaint from './canvas-paint/index.vue'
export default {
    components: {
        CanvasPaint
    }
}
</script>