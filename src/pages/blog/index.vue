<template>
  <div class="blog">
    <div class="left">
      <ul>
        <li
          v-for="blogname in blognames"
          :key='blogname'
        >
          <router-link :to="getBlogPath(blogname)">{{blogname}}</router-link>
        </li>
      </ul>
      
      <tabs v-model="activeBlog">
        <tab-panel
          v-for="blogname in blognames"
          :key='blogname'
          :name='blogname'
        ></tab-panel>
      </tabs>
    </div>
    <div class="right">
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
export const blognames = ['nuxt', 'source-map', 'vue-ssr'];
import { Tabs, TabPanel } from '../../components/tabs'
export default {
  name: 'BlogVueSSr',
  components: {
    Tabs,
    TabPanel
  },
  setup() {
    let activeBlog = ref('nuxt');
    return {
      activeBlog,
      blognames,
      getBlogPath(blogname) {
        return '/blog/' + blogname
      }
    }
  }
}
</script>
<style lang="scss">
.blog {
  display: flex;
  flex-direction: row;
  .left {
    display: flex;
    flex: 1;
  }
  .right {
    display: flex;
    flex: 5;
  }
}
</style>
