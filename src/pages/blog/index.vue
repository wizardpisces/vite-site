<template>
  <div class="blog">
    <div class="left">
      <klk-tabs
        v-model="activeBlog"
        tab-position='left'
      >
        <klk-tab-panel
          v-for="blog in blogList"
          :key='blog.name'
          :name='blog.name'
        >
          <p
            style="margin:0"
            v-html="blogContent"
          ></p>
        </klk-tab-panel>
      </klk-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch } from "vue";
// import { blogs } from "../../constants";

// const blogMap = blogs.map((blogRelativePath) => {
//   return {
//     name: blogRelativePath,
//     value: import(`../../blog/nuxt.md`),
//   };
// });

// const blogMap: Record<string, Promise<any>> = blogMap.reduce(
//   (res: Record<string, Promise<any>>, cur) => {
//     res[cur.name] = cur.value;
//     return res;
//   },
//   {}
// );

type BlogItem = {
  originalName: string;
  name: string;
  value: () => Promise<any>;
};

// @ts-ignore
const modules = import.meta.glob("../../blog/**/*.md");

const blogMap: Record<string, () => Promise<any>> = modules;

const blogList: BlogItem[] = Object.keys(modules).reduce(
  (list: BlogItem[], originalName) => {
    // @ts-ignore
    let blogName = originalName.match(/\/([^\/]+).md$/)[1];

	blogMap[blogName] = blogMap[originalName]

    list.push({
      originalName,
      name: blogName,
      value: modules[originalName],
    });
    return list;
  },
  []
);

export default {
  name: "BlogVueSSr",
  setup() {
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
    };
  },
};
</script>
<style lang="scss">
.blog {
  margin-top: 20px;
}
</style>
