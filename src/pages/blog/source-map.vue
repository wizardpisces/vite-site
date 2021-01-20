<template>
  <div v-html="html"></div>
</template>

<script>
import { html } from './md-blog/source-map.md'
export default {
  setup() {
    return {
      html
    }
  }
}
</script>
