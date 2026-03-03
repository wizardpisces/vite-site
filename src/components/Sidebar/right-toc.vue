<template>
  <aside class="right-toc" :class="{ 'toc-hidden': !showRightToc }" v-if="headers && headers.length" ref="tocRef">
    <div class="toc-header">
      目录
      <span class="toc-progress" v-if="readProgress > 0">{{ readProgress }}%</span>
    </div>
    <div class="toc-content">
      <tree-folder-sub-headers :headers="headers"></tree-folder-sub-headers>
    </div>
  </aside>
</template>

<script lang="ts">
import { PropType, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import useBlog, { SubHeader, findSubHeaderByTitle } from "@/composition/use-blog";
import useLayout from "@/composition/use-layout";
import TreeFolderSubHeaders from "./tree-folder-sub-headers.vue";

export default {
  name: "RightToc",
  components: {
    TreeFolderSubHeaders
  },
  props: {
    headers: {
      type: Array as PropType<SubHeader[]>,
      default: () => []
    }
  },
  setup(props) {
    const { showRightToc } = useLayout();
    const { setActiveSubHeader } = useBlog();
    const tocRef = ref<HTMLElement | null>(null);
    const readProgress = ref(0);
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActiveHeading();
        updateProgress();
        ticking = false;
      });
    }

    function updateActiveHeading() {
      const headings = document.querySelectorAll(
        '.article-content h1[id], .article-content h2[id], .article-content h3[id], .article-content h4[id]'
      );
      if (!headings.length) return;

      const offset = 90;
      let current: Element | null = null;

      for (const h of headings) {
        if (h.getBoundingClientRect().top <= offset) {
          current = h;
        }
      }

      if (current) {
        const title = current.id;
        const sub = findSubHeaderByTitle(title);
        if (sub) {
          setActiveSubHeader(sub);
          scrollTocToActive();
        }
      }
    }

    function updateProgress() {
      const article = document.querySelector('.article-content');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) { readProgress.value = 100; return; }
      const scrolled = -rect.top;
      readProgress.value = Math.min(100, Math.max(0, Math.round((scrolled / total) * 100)));
    }

    function scrollTocToActive() {
      nextTick(() => {
        const container = tocRef.value;
        const activeEl = container?.querySelector('.tree-folder-sub-header.active > a') as HTMLElement | null;
        if (!container || !activeEl) return;

        const containerRect = container.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();

        if (elRect.top < containerRect.top + 40 || elRect.bottom > containerRect.bottom - 40) {
          container.scrollTop += elRect.top - containerRect.top - containerRect.height / 3;
        }
      });
    }

    onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); });
    onUnmounted(() => { window.removeEventListener('scroll', onScroll); });

    watch(() => props.headers, () => {
      nextTick(() => { updateActiveHeading(); updateProgress(); });
    });

    return { showRightToc, tocRef, readProgress };
  }
};
</script>

<style lang="scss">
.right-toc {
  position: fixed;
  top: 70px;
  right: 0;
  bottom: 0;
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-left: 1px solid #eaecef;
  overflow-y: auto;
  padding: 12px 0;
  font-size: 13px;
  box-shadow: -1px 0 2px rgba(0, 0, 0, 0.03);
  z-index: 120;
  transition: transform 0.3s ease, opacity 0.3s ease;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  .toc-header {
    padding: 0 12px 8px;
    font-weight: 600;
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .toc-progress {
      font-size: 10px;
      font-weight: 500;
      color: #2563eb;
      background: rgba(37, 99, 235, 0.08);
      padding: 1px 6px;
      border-radius: 8px;
      letter-spacing: 0;
      text-transform: none;
    }
  }

  .toc-content {
    padding: 4px 8px;
  }

  &.toc-hidden {
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
  }

  @media (max-width: 959px) {
    display: none;
  }
}
</style> 