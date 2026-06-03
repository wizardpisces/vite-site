<template>
  <div class="home">
    <section class="home-intro">
      <div class="home-intro-content">
        <div class="eyebrow">WizardPisces Blog</div>
        <h1>文章</h1>
        <p>
          记录 AI、工程系统、前端技术和长期技术判断。
        </p>
      </div>
    </section>

    <section class="articles">
      <div class="section-header">
        <h2>Latest writing</h2>
        <router-link to="/blog/Introduction">进入文章目录</router-link>
      </div>
      <div class="article-list">
        <router-link
          v-for="article in latestBlogs"
          :key="article.blogLink"
          :to="createBlogRoutePath(article)"
          class="article-row"
        >
          <span class="article-category">{{ formatFreshness(article) }}</span>
          <span class="article-title">{{ article.blogTitle }}</span>
          <span class="article-excerpt">{{ formatBlogPath(article) }}</span>
        </router-link>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import { computed } from 'vue';
import useBlog, { createBlogRoutePath } from '@/composition/use-blog';
import type { BlogDescriptor } from '@/composition/use-blog';

const FRESHNESS_STATUS_LABEL: Record<BlogDescriptor['blogFreshness']['status'], string> = {
  added: '新增',
  modified: '修改',
  unknown: '文章',
};

function formatDate(timestamp: number) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default {
  name: 'Home',
  setup() {
    const { getLatestBlogs } = useBlog();
    const latestBlogs = computed(() => getLatestBlogs(8));

    function formatFreshness(article: BlogDescriptor) {
      const freshness = article.blogFreshness;
      const date = formatDate(freshness.changedAt);
      const status = FRESHNESS_STATUS_LABEL[freshness.status];

      return date ? `${date} · ${status}` : status;
    }

    function formatBlogPath(article: BlogDescriptor) {
      const pathParts = article.blogLink
        .replace('/src/blog/', '')
        .replace(/\.md$/, '')
        .split('/');

      if (pathParts.length === 1) {
        return 'blog';
      }

      return pathParts.slice(0, -1).join(' / ');
    }

    return {
      latestBlogs,
      createBlogRoutePath,
      formatFreshness,
      formatBlogPath,
    };
  }
}
</script>
<style lang="scss">
.home {
  background: #f7f4ed;
  min-height: calc(100vh - 70px);
  position: relative;

  .home-intro {
    padding: 4rem 2rem 3rem;
    border-bottom: 1px solid #d8d0c4;
  }

  .home-intro-content {
    max-width: 1120px;
    margin: 0 auto;
  }

  .eyebrow {
    color: $color-text-muted;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  h1 {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 400;
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1;
    margin: 0 0 1.25rem;
    color: $color-text-primary;
  }

  p {
    max-width: 680px;
    margin: 0;
    color: $color-text-secondary;
    font-size: 1.08rem;
    line-height: 1.7;
  }

  .topic-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1.75rem;

    a {
      color: $color-text-primary;
      text-decoration: none;
      border-bottom: 1px solid $color-text-muted;
      padding-bottom: 2px;
      font-size: 0.95rem;
      transition: color 0.18s ease, border-color 0.18s ease;

      &:hover {
        color: $color-accent;
        border-bottom-color: $color-accent;
      }
    }
  }

  .articles {
    max-width: 1120px;
    margin: 0 auto;
    padding: 3rem 2rem 5rem;
  }

  .section-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #d8d0c4;

    h2 {
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.7rem;
      font-weight: 400;
      color: $color-text-primary;
    }

    a {
      color: $color-text-secondary;
      text-decoration: none;
      font-size: 0.95rem;
      border-bottom: 1px solid transparent;
      transition: color 0.18s ease, border-color 0.18s ease;

      &:hover {
        color: $color-accent;
        border-bottom-color: $color-accent;
      }
    }
  }

  .article-list {
    border-bottom: 1px solid #d8d0c4;
  }

  .article-row {
    display: grid;
    grid-template-columns: 150px minmax(220px, 0.8fr) minmax(260px, 1.2fr);
    gap: 1.5rem;
    align-items: baseline;
    padding: 1.25rem 0;
    border-bottom: 1px solid #d8d0c4;
    color: inherit;
    text-decoration: none;
    transition: color 0.18s ease;

    &:hover {
      .article-title {
        color: $color-accent;
      }
    }

    &:last-child {
      border-bottom: 0;
    }

    .article-category {
      color: $color-text-muted;
      font-size: 0.88rem;
    }

    .article-title {
      color: $color-text-primary;
      font-size: 1.12rem;
      font-weight: 500;
      line-height: 1.4;
      transition: color 0.18s ease;
    }

    .article-excerpt {
      color: $color-text-secondary;
      font-size: 0.98rem;
      line-height: 1.55;
    }
  }

  @media (max-width: 768px) {
    .home-intro {
      padding: 2.75rem 1rem 2.25rem;
    }

    .articles {
      padding: 2.25rem 1rem 4rem;
    }

    .section-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .article-row {
      grid-template-columns: 1fr;
      gap: 0.4rem;
    }
  }
}
</style>
