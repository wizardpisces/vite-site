<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Not found your route <b>{{route.path}}</b> ,try to navigate from navBar</p>
    <p class='desc'> this is a test for en-SG, for liuze'blog and tiny-sass-compiler's demo</p>
  </div>
</template>
<script type="ts">
import { useRoute } from 'vue-router';

export default {
  name: 'NotFound',
  setup() {
    let route = useRoute();
    return {
      route
    }
  }
}
</script>
<style type="scss">
.not-found{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
