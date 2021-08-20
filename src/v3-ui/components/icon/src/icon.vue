<template>
  <svg
    :class="classes"
    :style="styles"
  >
    <use :xlink:href="linkType"></use>
  </svg>
</template>

<script lang="ts">
import { computed } from "@vue/runtime-core";
const prefixCls = "v3-icon";
export default {
  name: "V3Icon",
  props: {
    type: String,
    size: [Number, String],
    color: String,
  },
  setup(props) {
    let classes = computed(() => [prefixCls, `${prefixCls}-${props.type}`]);
    let styles = computed(() => {
      let style: Record<string, string> = {};
      if (props.size) {
        style["width"] = `${parseFloat(props.size.toString())}px`;
        style["height"] = `${parseFloat(props.size.toString())}px`;
      }

      if (props.color) {
        style.color = props.color;
      }
      return style;
    });
    
    let linkType = computed(() => "#icon-" + props.type);

    return {
      classes,
      styles,
      linkType,
    };
  },
};
</script>