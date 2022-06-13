<template>
  <div class="nav-links">
    <div
      v-for="routeItem in navRoutes"
      :key="routeItem.name"
      :class="{
        'nav-item':true,
        'active-nav':route.name == routeItem.name
      }"
      @click.stop="onTabClick(routeItem.name)"
    >
      {{routeItem.name}}
    </div>
    <div class="nav-item">
      <a
        class="github"
        target="__blank"
        href="https://github.com/wizardpisces/vite-site"
      >Github home
        <v3-icon
          type="outbound"
          size="16"
          color="#aaa"
        ></v3-icon>

      </a>
    </div>
  </div>
</template>
<script lang="ts">
import { useRoute, useRouter } from "vue-router";
import { navRoutes } from "../router";
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
    return {
      onTabClick,
      navRoutes,
      route,
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
    font-size:16px;
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
    .nav-item{
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