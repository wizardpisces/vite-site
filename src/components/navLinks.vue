<template>
  <div class="nav-links">
    <div
      v-for="routeItem in visibleNavRoutes"
      :key="routeItem.name"
      :class="{
        'nav-item': true,
        'active-nav': isActive(routeItem),
      }"
      @click.stop="onTabClick(routeItem)"
    >
      {{ routeItem.name }}
    </div>
    <div
      :class="{
        'nav-item': true,
        'wechat-nav-item': true,
        'wechat-open': wechatOpen,
      }"
    >
      <button
        type="button"
        class="wechat-trigger"
        aria-haspopup="true"
        :aria-expanded="wechatOpen ? 'true' : 'false'"
        @click.stop="toggleWechat"
      >
        公众号
      </button>
      <div class="wechat-popover" v-show="wechatOpen" @click.stop>
        <div class="wechat-popover-arrow"></div>
        <div class="wechat-popover-title">扫码关注公众号</div>
        <img
          v-if="!wechatQrFailed"
          class="wechat-qrcode"
          :src="wechatQrSrc"
          alt="公众号二维码"
          @error="wechatQrFailed = true"
        />
        <div v-else class="wechat-qrcode-missing">
          二维码图片未配置
        </div>
      </div>
    </div>
    <div class="nav-item">
      <a
        class="github"
        target="__blank"
        href="https://github.com/wizardpisces"
        >Github
        <v3-icon type="outbound" size="16" color="#aaa"></v3-icon>
      </a>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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
    const wechatOpen = ref(false);
    const wechatQrFailed = ref(false);
    const wechatQrSrc = "/wechat-official-account.jpg";
    const hiddenNavNames = new Set([
      "Sass",
      "Huffman",
      "MachineLearning",
      "VirtualMachine",
      "Test",
      "MicroSubAppReact",
      "Bookmark",
      "TypeScript-Json-Schema",
    ]);
    const visibleNavRoutes = computed(() => {
      return navRoutes.filter((routeItem) => {
        const routeName = String(routeItem.name || "");
        return !hiddenNavNames.has(routeName);
      });
    });

    function onTabClick(routeItem: RouteRecordRaw) {
      const name = routeItem.name as string;
      const path = routeItem.path;
      wechatOpen.value = false;

      if (name === "Blog") {
        router.push({ path: "/blog/Introduction" });
      } else {
          router.push({ path });
      }
    }

    function toggleWechat() {
      wechatOpen.value = !wechatOpen.value;
    }

    function closeWechat() {
      wechatOpen.value = false;
    }

    onMounted(() => {
      document.addEventListener("click", closeWechat);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", closeWechat);
    });

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
      visibleNavRoutes,
      isActive,
      wechatOpen,
      wechatQrFailed,
      wechatQrSrc,
      toggleWechat,
    };
  },
};
</script>
<style lang="scss">
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-width: 0;
  .nav-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
    color: $color-text-secondary;
    font-size: 15px;
    padding: 0.35rem 0;
    transition: color 0.18s ease;
    position: relative;
    white-space: nowrap;
    
    &:hover {
      color: $color-primary;
    }
    
    &.active-nav {
      color: $color-primary;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 2px;
        background: $color-primary;
      }
    }

    &.wechat-nav-item {
      overflow: visible;
      padding: 0;

      &::before {
        display: none;
      }
    }
  }
  .wechat-trigger {
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-weight: 500;
    padding: 0;
  }
  .wechat-popover {
    position: absolute;
    top: calc(100% + 14px);
    left: 50%;
    transform: translateX(-50%);
    width: 276px;
    box-sizing: border-box;
    padding: 24px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
    cursor: default;
    z-index: 102;
  }
  .wechat-popover-arrow {
    position: absolute;
    top: -9px;
    left: 50%;
    width: 18px;
    height: 18px;
    transform: translateX(-50%) rotate(45deg);
    background: #fff;
    border-left: 1px solid #e5e7eb;
    border-top: 1px solid #e5e7eb;
  }
  .wechat-popover-title {
    margin-bottom: 18px;
    text-align: center;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.4;
  }
  .wechat-qrcode {
    display: block;
    width: 220px;
    height: 220px;
    margin: 0 auto;
    object-fit: contain;
  }
  .wechat-qrcode-missing {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 220px;
    height: 220px;
    margin: 0 auto;
    border: 1px dashed #d8d0c4;
    color: #8a8178;
    font-size: 14px;
    background: #f7f4ed;
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
    align-items: stretch;
    gap: 0;
    border-bottom: 1px solid #eaecef;
    .nav-item {
      margin: 10px 0 10px 20px;
      &.active-nav,
      &:hover {
        border-bottom: none;
        color: $color-primary;
      }
    }
    .wechat-nav-item {
      align-items: flex-start;
      flex-direction: column;
    }
    .wechat-popover {
      position: relative;
      top: auto;
      left: auto;
      transform: none;
      width: min(280px, calc(100vw - 60px));
      margin: 8px 0 0;
      padding: 22px;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
    }
    .wechat-popover-arrow {
      display: none;
    }
    .wechat-qrcode {
      width: 210px;
      height: 210px;
    }
    .wechat-qrcode-missing {
      width: 210px;
      height: 210px;
    }
  }
}
</style>
