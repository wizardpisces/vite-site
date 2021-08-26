<template>
  <div class="home">
    <h1>Hello.</h1>
    <p class="desc">This is a static responsive site by Vite@2+vue@3+vuex@4+vue-router@4</p>
    <p class="desc-feature">
      1. <router-link to="/sass">Demo Page</router-link> of <a href="https://github.com/wizardpisces/tiny-sass-compiler" target="__blank">tiny-sass-compiler</a> <br>
      2. <router-link to="/blog/《系统之美》">Blog page</router-link> <br>
      3. <router-link to="/bookmark">Bookmarks</router-link>
    </p>
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
  padding: 20px 60px;
  .desc {
    font-weight: 500;
    font-size: 20px;
  }
  .desc-feature {
    font-weight: 400;
    font-size: 18px;
    a {
      font-size:18px;
      color: #000;
      position: relative;
      &:after {
        content: "";
        position: absolute;
        z-index: -1;
        top: 60%;
        left: 0;
        right: 0;
        bottom: 0;
        transition: top 200ms cubic-bezier(0, 0.8, 0.13, 1);
        background-color: #f29d8280;
      }
      &:hover{
        &::after{
          top:0;
        }
      }
    }
  }
}
</style>
