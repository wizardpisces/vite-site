<template>
  <button :class="cClass">
    <slot></slot>
  </button>
</template>
<script>
export default {
  name: 'klk-button',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator(val) {
        return ['primary', 'secondary', 'ghost', 'outlined'].includes(val);
      }
    },
    htmlType: {
      type: String,
      default: 'button'
    },
    size: {
      type: String,
      validator(val) {
        return ['mini', 'small', 'normal', 'large'].includes(val);
      }
    },
  },
  setup(props, ctx) {
    const cClass = {
      'klk-button': true,
      [`klk-button-${props.type}`]: true,
      [`klk-button-${props.size}`]: !!props.size,
    }
    return {
      cClass
    }
  }
}
</script>