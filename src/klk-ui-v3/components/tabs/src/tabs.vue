<template>
  <div :class="tabsClass">
    <div class='tabs-header'>
      <div class='tabs-items'>
        <div
          v-for="(panel,index) in panels"
          :class="getItemClass(panel)"
          :key='index'
          @click="handleTabClick(panel)"
        >{{panel.name}}</div>
      </div>
    </div>
    <div class="tabs-body">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import { provide, ref, watch, watchEffect } from 'vue'
export const rootTabs = Symbol('rootTabs')
export default {
  name: 'klk-tabs',
  props: {
    modelValue: String,
    tabPosition: {
      type: String,
      default: 'top', // 'top' | 'left' | 'bottom' | 'right'
    },
  },
  setup(props, ctx) {
    const panels = ref([]),
      curValue = ref(props.modelValue || '');

    watch(() => props.modelValue, (val) => {
      changeCurrentName(val)
    })

    provide(rootTabs, {
      curValue: curValue,
      onPanelAdd: (panel) => {
        if (panels.value.includes(panel)) return;
        panels.value.push(panel);
      },
      onPanelRemove: (panel) => {
        const index = panels.value.indexOf(panel);
        if (index !== -1) {
          panels.value.splice(index, 1)
        }
      }
    })

    function changeCurrentName(value) {
      curValue.value = value;
      ctx.emit('input', value);
      ctx.emit('update:modelValue', value)
    }

    function handleTabClick(panel) {
      changeCurrentName(panel.name)
      ctx.emit('tab-click', panel.name);
    }

    function getItemClass(panel) {
      return {
        'tabs-item': true,
        'tabs-item-active': panel.active,
        // 'klk-tabs-item-disabled': panel.disabled,
      };
    }

    return {
      panels,
      handleTabClick,
      getItemClass,
      tabsClass: ['klk-tabs', `is-${props.tabPosition}`]
    }
  }
}

</script>