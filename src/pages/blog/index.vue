<template>
  <div class="blog">
    <div class="left">
      <tabs
        v-model="activeBlog"
        tab-position='left'
      >
        <tab-panel
          v-for="blog in blogs"
          :key='blog.name'
          :name='blog.name'
        >
          <p style="margin:0" v-html="blog.value"></p>
        </tab-panel>
      </tabs>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Tabs, TabPanel } from '../../components/tabs'

import { html as nuxt } from './md-blog/nuxt.md'
import { html as sourceMap } from './md-blog/source-map.md'
import { html as vueSSR } from './md-blog/vue-ssr.md'

export const blogs = [
  { name: 'nuxt', value: nuxt },
  { name: 'sourceMap', value: sourceMap },
  { name: 'vueSSR', value: vueSSR }
];

export default {
  name: 'BlogVueSSr',
  components: {
    Tabs,
    TabPanel
  },
  setup() {
    const router = useRouter(),
        route = useRoute();

    const activeBlog = ref('nuxt') 

    return {
      activeBlog,
      blogs
    }
  }
}
</script>
<style lang="scss">
.blog {
  margin-top:20px;
}
</style>
