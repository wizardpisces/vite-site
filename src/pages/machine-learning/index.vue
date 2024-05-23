<template>
    <div id="machine-learning">
        <h1>machine learning Demo</h1>
        <ul>
            <li v-on:click="jumpTo('mnist')" :class="{active: $route.name === 'mnist'}">Mnist</li>
            <li v-on:click="jumpTo('irises')" :class="{ active: $route.name === 'irises' }">Irises</li>
            <li v-on:click="jumpTo('WebGPU')" :class="{ active: $route.name === 'WebGPU' }">WebGPU</li>
        </ul>
        <Suspense><router-view></router-view></Suspense>
    </div>
</template>
<script lang="ts">
import { useRoute, useRouter } from "vue-router";
export default {
    setup() {
        const router = useRouter();
        const jumpTo = (name: string) => {
            router.push({ name });
        }
        return {
            jumpTo
        }
    },
}
</script>
<style lang="scss" scoped>
#machine-learning {
    padding: 10px 24px;
    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
      display: flex;
    }
    
    li {
      background-color: #fff;
      border: 1px solid #eee;
      margin: 10px 0;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      &:hover{
        background-color: #eee;
      }
      &.active {
        background-color: #eee;
      }
    }
}
</style>