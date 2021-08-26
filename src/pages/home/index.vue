<template>
  <div class="home">
    <h1>Hello.</h1>
    <h3>This is a static responsive site based on Vite@2+vue@3+vuex@4+vue-router@4</h3>
    <h3>Features</h3>
    <ul>
      <li>
        <a href="https://github.com/wizardpisces/tiny-sass-compiler">tiny-sass-compiler's </a>
        <router-link to="/sass">Demo Page</router-link>
      </li>
      <li>
        <router-link to="/blog/《系统之美》">Blog</router-link>
      </li>
      <li>
        <router-link to="/bookmark">Bookmarks</router-link>
      </li>
    </ul>
  </div>
</template>
<script type="ts">
export default {
  name: 'Home',
  setup() {
  }
}
</script>
<style lang="scss">
.home {
  padding: 20px;
  a{
    color:#000;
    &:hover{
      color:$color-primary;
    }
  }
}
</style>
