<template>
    <div id="machine-learning">
        <h1>machine learning Demo</h1>
        <ul>
            <li v-on:click="jumpTo('mnist')">Mnist</li>
            <li v-on:click="jumpTo('irises')">Irises</li>
        </ul>
        <router-view></router-view>
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
      background-color: #f2f2f2;
      border: 1px solid #ddd;
      margin: 10px 0;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      &:hover{
        background-color: #ddd;
      }
    }
}
</style>