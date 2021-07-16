<template>
  <div class="blog">
    <aside class='sidebar'>
      <tree-folder :folder='categoryGroup'></tree-folder>
      <!-- <klk-tabs
        v-model="activeBlog"
        tab-position='left'
      >
        <klk-tab-panel
          v-for="blog in blogList"
          :key='blog.name'
          :name='blog.name'
        >

        </klk-tab-panel>
      </klk-tabs> -->
    </aside>
    <main class='page'>
      <div class="content">
        <p v-html="blogContent"></p>
        <Circular :check="4"></Circular>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { ref, watch } from "vue";
import useBlog from "./composition/use-blog";
import TreeFolder from './tree-folder.vue'
import A from './a.vue'
export default {
  name: "BlogVueSSr",
  components:{
    // TreeFolder:() => import("./tree-folder.vue")
    TreeFolder,
    Circular : A
  },
  setup() {
    let { blogList, blogMap, categoryGroup } = useBlog();
    let activeBlog = ref(blogList[0].name);
    let blogContent = ref();

    function fetchBlog(blog: string) {
      blogMap[blog]().then((res) => {
        // console.log(res.html);
        blogContent.value = res.html;
      });
    }

    fetchBlog(activeBlog.value);

    watch(activeBlog, (blog, prevBlog) => {
      fetchBlog(blog);
    });

    return {
      activeBlog,
      blogList,
      blogContent,
      categoryGroup
    };
  },
};
</script>
<style lang="scss">
.blog {
  .sidebar {
    font-size: 16px;
    background-color: #fff;
    width: 200px;
    position: fixed;
    z-index: 10;
    margin: 0;
    top: 50px;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    border-right: 1px solid #eaecef;
    overflow-y: auto;
  }
  .page {
    padding-left: 200px;
    display: block;
    .content {
      max-width: 740px;
      margin: 0 auto;
    }
  }
}
</style>
