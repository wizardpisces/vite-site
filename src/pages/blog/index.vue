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
        </div>
        <div class="right">
            <router-view />
        </div>
    </div>
</template>

<script>
export const blognames =  ['nuxt', 'source-map', 'vue-ssr'];
export default {
  name: 'BlogVueSSr',
  setup() {
    return {
      blognames,
      getBlogPath(blogname) {
        return '/blog/' + blogname
      }
    }
  }
}
</script>
<style lang="scss">
    .blog{
        display: flex;
        flex-direction: row;
        .left{
            display: flex;
            flex: 1;
        }
        .right{
            display: flex;
            flex:5;
        }
    }
</style>
