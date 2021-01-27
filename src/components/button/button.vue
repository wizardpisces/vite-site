<template>
  <button :class="cClass">
    <slot></slot>
  </button>
</template>
<script>
export default {
  name: 'klk-button',
  setup(props, ctx) {
    const cClass = {
      'klk-button': true
    }
    return {
      cClass
    }
  }
}
</script>