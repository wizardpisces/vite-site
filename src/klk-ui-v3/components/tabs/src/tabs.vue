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
<script lang="ts">
import { provide, ref, watch, Ref, ComputedRef } from "vue";

export const rootTabs = Symbol("rootTabs");

export type Panel = {
  active: ComputedRef<boolean>;
  name: string;
};

export interface RootTabs {
  curValue: Ref<string>;
  onPanelAdd: (panel: Panel) => void;
  onPanelRemove: (panel: Panel) => void;
}

export default {
  name: "klk-tabs",
  props: {
    modelValue: {
      type: String,
    },
    tabPosition: {
      type: String,
      default: "top", // 'top' | 'left' | 'bottom' | 'right'
    },
  },
  setup(props, ctx) {
    const panels = ref<Panel[]>([]),
      curValue = ref<string>(props.modelValue || "");

    watch(
      () => props.modelValue,
      (val) => {
        changeCurrentName(val);
      }
    );

    provide<RootTabs>(rootTabs, {
      curValue: curValue,
      onPanelAdd: (panel: Panel) => {
        if (panels.value.includes(panel)) return;
        panels.value.push(panel);
      },
      onPanelRemove: (panel: Panel) => {
        const index = panels.value.indexOf(panel);
        if (index !== -1) {
          panels.value.splice(index, 1);
        }
      },
    });

    function changeCurrentName(value: Panel["name"]) {
      curValue.value = value;
      ctx.emit("input", value);
      ctx.emit("update:modelValue", value);
    }

    function handleTabClick(panel: Panel) {
      changeCurrentName(panel.name);
      ctx.emit("tab-click", panel.name);
    }

    function getItemClass(panel: Panel) {
      return {
        "tabs-item": true,
        "tabs-item-active": panel.active,
        // 'klk-tabs-item-disabled': panel.disabled,
      };
    }

    return {
      panels,
      handleTabClick,
      getItemClass,
      tabsClass: ["klk-tabs", `is-${props.tabPosition}`],
    };
  },
};
</script>