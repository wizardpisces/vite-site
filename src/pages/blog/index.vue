<template>
  <div class="blog">
    <div class="left">
      <klk-tabs
        v-model="activeBlog"
        tab-position='left'
      >
        <klk-tab-panel
          v-for="blog in blogs"
          :key='blog.name'
          :name='blog.name'
        >
          <p style="margin:0" v-html="blog.value"></p>
        </klk-tab-panel>
      </klk-tabs>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

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
  setup() {
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
