<template>
  <div :class="cClass">
    v3-message
  </div>
</template>
<script>
export default {
  name: 'v3-message',
  props: {
  },
  setup(props, ctx) {
    const cClass = {
      'v3-message': true,
    }
    return {
      cClass
    }
  }
}
</script>