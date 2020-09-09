<template>
  <Menu msg="Hello Vue 3.0 + Vites" />
  {{compiledResult}}
</template>

<script>
import Menu from './components/menu.vue'
import {compile} from  'tiny-sass-compiler/dist/tiny-sass-compiler.esm-browser.prod.js'

const compiledResult = compile(`$font-stack:    Helvetica, sans-serif;
$primary-color: #333;

body .test{
  font: 100% $font-stack;
  color: 
  $primary-color;
}
`)

export default {
  name: 'App',
  data(){
    return {
      compiledResult
    };
  },
  components: {
    Menu
  }
}
</script>
