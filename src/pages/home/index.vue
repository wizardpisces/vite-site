<template>
  <div class="home">
    <h3>A static responsive site based on [ Vite@2 ,vue@3 ,vuex@4 ,vue-router@4 ]</h3>
    <h4>Features</h4>
    <ul>
      <li>
        <router-link to="/sass">tiny-sass-compiler demo</router-link>
        <ul>
          <li>Another sass compiler writen from scatch，runnable on both node and browser( <a href="https://github.com/wizardpisces/tiny-sass-compiler">source</a> )</li>
        </ul>
      </li>
      <li>
        <router-link to="/blog/《系统之美》">blog home</router-link>
        <ul>
          <li>auto generation by .md</li>
          <li>lazy load by name</li>
        </ul>
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
}
</style>
