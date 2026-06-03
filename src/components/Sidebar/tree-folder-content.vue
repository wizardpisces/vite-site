<template>
  <div :class="cls" v-show="isVisible">
    <a
      href="javascript:void(0)"
      @click="onBlogClick(blog)"
      class="tree-folder-content-title"
      :title="blog.blogTitle"
    >
      <span class="blog-row">
        <span class="blog-title" v-if="searchTerm" v-html="highlightTitle"></span>
        <span class="blog-title" v-else>{{blog.blogTitle}}</span>
      </span>
      <span class="blog-freshness-date">{{ formatBlogFreshnessDate(blog) }}</span>
    </a>
  </div>
</template>

<script lang="ts">
import { computed, PropType, inject, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import useBlog, {
  BlogDescriptor,
  createBlogRoutePath,
  formatBlogFreshnessDate
} from "@/composition/use-blog";

export default {
  name: "TreeFolderContent",
  props: {
    blog: {
      type: Object as PropType<BlogDescriptor>,
      required: true
    },
  },
  setup(props) {
    const router = useRouter();
    const { setActiveBlog, activeBlog, fetchMetaByBlogLink } = useBlog();
    const searchTerm = inject<Ref<string>>('blogSearchTerm', ref(''));

    const cls = computed(() => ({
      "tree-folder-content": true,
      active: activeBlog.value.blogLink === props.blog?.blogLink,
    }));

    const isVisible = computed(() => {
      if (!searchTerm.value) return true;
      return props.blog.blogTitle.toLowerCase().includes(searchTerm.value.toLowerCase());
    });

    const highlightTitle = computed(() => {
      if (!searchTerm.value) return props.blog.blogTitle;
      const regex = new RegExp(`(${searchTerm.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return props.blog.blogTitle.replace(regex, '<mark>$1</mark>');
    });

    const onBlogClick = async (blog: BlogDescriptor) => {
      setActiveBlog(blog);
      await fetchMetaByBlogLink(blog.blogLink);
      router.push(createBlogRoutePath(blog));
    };

    return {
      blog: props.blog,
      onBlogClick,
      cls,
      isVisible,
      searchTerm,
      highlightTitle,
      formatBlogFreshnessDate,
    };
  },
};
</script>

<style lang="scss">
$blog-text: #5f574f;
$blog-hover: #8a3f2d;
$blog-active: #141413;
$blog-hover-bg: #eee8dc;
$blog-active-bg: #eee8dc;

.tree-folder-content {
  font-size: 13px;
  
  a {
    display: block;
    color: $blog-text;
    transition: all 0.2s;
    padding: 5px 10px;
    line-height: 1.4;
    text-decoration: none !important;
    border-radius: 0;
    position: relative;
    overflow: hidden;
    
    &:hover {
      color: $blog-hover !important;
      background-color: $blog-hover-bg;
    }
  }

  .blog-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .blog-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .blog-freshness-date {
    display: block;
    margin-top: 2px;
    color: #8a8178;
    font-size: 11px;
    line-height: 1.2;
  }

  mark {
    background: rgba(250, 204, 21, 0.4);
    color: inherit;
    padding: 0 1px;
    border-radius: 2px;
  }

  &.active {
    & > a {
      color: $blog-active !important;
      font-weight: 500;
      background-color: $blog-active-bg;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 14px;
        background-color: $blog-active;
      }
    }
  }
}
</style>
