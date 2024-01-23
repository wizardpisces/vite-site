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
        if(name === 'MicroSubAppReact'){
          router.push({ path: path.replace("*","") });
          // router.push({ name });
        }else{
          router.push({ path });
        }
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
    margin-right: 20px;
    cursor: pointer;
    font-weight: 500;
    color: #2c3e50;
    font-size: 16px;
    &.active-nav,
    &:hover {
      border-bottom: 2px solid $color-primary;
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