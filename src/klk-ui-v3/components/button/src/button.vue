<template>
  <button :class="cClass">
    <slot></slot>
  </button>
</template>
<script lang="ts">
export default {
  name: "klk-button",
  props: {
    type: {
      type: String,
      default: "primary",
      validator(val:string) {
        return ["primary", "secondary", "ghost", "outlined"].includes(val);
      },
    },
    size: {
      type: String,
      validator(val:string) {
        return ["mini", "small", "normal", "large"].includes(val);
      },
    },
  },
  setup(props:any, ctx) {
    const cClass = {
      "klk-button": true,
      [`klk-button-${props.type}`]: true,
      [`klk-button-${props.size}`]: !!props.size,
    };
    return {
      cClass,
    };
  },
};
</script>