<template>
  <div
    class='tabs'
    :class="tabsClass"
  >
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
  name: 'Tabs',
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
      tabsClass: ['tabs-header', `is-${props.tabPosition}`]
    }
  }
}

</script>
<style lang="scss" scoped>
$color-primary: blue;
@mixin tabPositionBorder($position: top, $color-primary: blue) {
  border: none;
  @if $position == top {
    border-bottom: 2px solid $color-primary;
  } @else if $position == left {
    border-right: 2px solid $color-primary;
  }
}
.tabs {
  &-header {
    display: flex;
    .tabs-items {
      display: flex;
      flex-direction: row;
      .tabs-item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        color: #000;
        font-size: 14px;
        padding: 0 10px;
        border-bottom: 2px solid transparent;
        &:hover {
          cursor: pointer;
          color: $color-primary;
        }
      }

      .tabs-item-active {
        @include tabPositionBorder(bottom);
        color: blue;
        border-bottom: 2px solid $color-primary;
      }
    }
  }
  &.is-left {
    flex-direction: row;
    .tabs-items {
      flex-direction: column;
      .tabs-item {
        height: 28px;
      }
      .tabs-item-active {
        @include tabPositionBorder(left);
      }
    }
  }
  .tabs-body {
    .tab-panel {
      display: flex;
      padding: 10px;
    }
  }
}
</style>