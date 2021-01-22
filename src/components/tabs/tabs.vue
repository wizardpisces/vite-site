<template>
  <div class='tabs'>
    <div class='tabs-items'>
      <div
        v-for="(panel,index) in panels"
        :class="getItemClass(panel)"
        :key='index'
        @click="handleTabClick(panel)"
      >{{panel.name}}</div>
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
  name: 'Tab',
  props: {
    modelValue: String
  },
  setup(props, ctx) {
    const panels = ref([]),
      curValue = ref(props.modelValue || '');

    watch(props.modelValue, (val) => {
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
        'klk-tabs-item': true,
        'klk-tabs-item-active': panel.active,
        // 'klk-tabs-item-disabled': panel.disabled,
      };
    }

    return {
      panels,
      handleTabClick,
      getItemClass
    }
  }
}

</script>
<style lang="scss" scoped>
.tabs {
  background: #666666;
}
</style>