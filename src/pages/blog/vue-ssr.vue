<template>
  <div v-html="html"></div>
</template>

<script>
import { html } from './md-blog/vue-ssr.md'
export default {
  setup() {
    return {
      html
    }
  }
}
</script>
