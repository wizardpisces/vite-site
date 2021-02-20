<template>
  <div :class="cClass">
    klk-message
  </div>
</template>
<script>
export default {
  name: 'klk-message',
  props: {
  },
  setup(props, ctx) {
    const cClass = {
      'klk-message': true,
    }
    return {
      cClass
    }
  }
}
</script>