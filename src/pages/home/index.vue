<template>
  <div class="home">
    <h1>Hello.</h1>
    <p class="desc">Brief Introduction</p>
    <p class="desc-feature" @click="proxyClick">
      1. <router-link to="/sass">Demo Page</router-link> of <a href="https://github.com/wizardpisces/tiny-sass-compiler" target="__blank">tiny-sass-compiler</a> <br>
      2. <router-link to="/blog/关于GPT">Blog page</router-link> <br>
    </p>
  </div>
</template>
<script type="ts">
export default {
  name: 'Home',
  setup() {
      return {
        proxyClick:(e)=>{
          // e.preventDefault();
          console.log('hehe');
        }
      }
  }
}
</script>
<style lang="scss">
.home {
  padding: 10px 24px;
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
