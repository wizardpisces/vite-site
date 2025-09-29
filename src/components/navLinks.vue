<template>
  <div class="nav-links">
    <div
      v-for="routeItem in navRoutes"
      :key="routeItem.name"
      :class="{
        'nav-item': true,
        'active-nav': isActive(routeItem),
      }"
      @click.stop="onTabClick(routeItem.name as string)"
    >
      {{ routeItem.name }}
    </div>
    <div class="nav-item">
      <a
        class="github"
        target="__blank"
        href="https://github.com/wizardpisces/vite-site"
        >Github home
        <v3-icon type="outbound" size="16" color="#aaa"></v3-icon>
      </a>
    </div>
  </div>
</template>
<script lang="ts">
import { RouteRecordRaw, useRoute, useRouter } from "vue-router";
import { navRoutes } from "../router";
function isSubsequence(parentRouteArray:string[], currentRouteArray:string[]) {
  let i = 0; // 指向 parentRouteArray
  let j = 0; // 指向 currentRouteArray
  while (i < parentRouteArray.length && j < currentRouteArray.length) {
    if (parentRouteArray[i] === currentRouteArray[j] || parentRouteArray[i].startsWith(':')) { // :name 是通配符
      i++; // 如果相等，则同时后移一位
    }
    j++; // 否则只移动j
  }
  return i === parentRouteArray.length; // 如果i移动到 parentRouteArray 的末尾，则说明 parentRouteArray 是 currentRouteArray 的子序列
}
export default {
  name: "NavLinks",
  setup() {
    let route = useRoute(),
      router = useRouter();

    function onTabClick(name: string) {
      let path = navRoutes.filter((route) => route.name === name)[0].path;

      if (name === "Blog") {
        router.push({ path: "/blog/Introduction" });
      } else {
          router.push({ path });
      }
    }

    let isActive = (routeItem:RouteRecordRaw) => {
      if (routeItem.path === "/") {
        // 特殊的 Home 路由，单独处理
        if (route.path === "/") {
          return true;
        }
      } else {
        return isSubsequence(routeItem.path.split("/"),route.path.split("/"));
      }
      return false
    };
    return {
      onTabClick,
      navRoutes,
      isActive,
    };
  },
};
</script>
<style lang="scss">
.nav-links {
  display: flex;
  // flex-wrap: wrap;
  .nav-item {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    cursor: pointer;
    font-weight: 500;
    color: $color-text-secondary;
    font-size: 15px;
    padding: 0.8rem 1.5rem;
    border-radius: 16px;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    overflow: hidden;
    
    // 添加微妙的内发光效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.15), transparent);
      transition: left 0.6s ease;
    }
    
    &:hover {
      color: $color-primary;
      background: rgba(37, 99, 235, 0.08);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 4px 15px rgba(37, 99, 235, 0.2),
        0 2px 8px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      
      &::before {
        left: 100%;
      }
    }
    
    &.active-nav {
      color: $color-primary;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(14, 165, 233, 0.08));
      box-shadow: 
        0 2px 12px rgba(37, 99, 235, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
      
      // 底部指示器重新设计
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 3px;
        background: $gradient-primary;
        border-radius: 2px 2px 0 0;
        box-shadow: 0 -2px 8px rgba(37, 99, 235, 0.4);
      }
    }
  }
  a {
    display: inline-block;
    color: inherit;
    font-weight: 500;
    .v3-icon {
      display: inline-block;
      vertical-align: middle;
      position: relative;
      top: -1px;
    }
  }
}
@media (max-width: 719px) {
  .nav-links {
    flex-direction: column;
    border-bottom: 1px solid #eaecef;
    .nav-item {
      margin: 10px 0 10px 20px;
      &.active-nav,
      &:hover {
        border-bottom: none;
        color: $color-primary;
      }
    }
  }
}
</style>