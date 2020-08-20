<template>
  <div>
    <h1>{{ msg }}</h1>
    <button @click="add">count is: {{ count }}</button>
    <router-link to="/blog/vue-ssr">Vue ssr</router-link>
    <router-view />
  </div>
</template>

<script>
import useCounter from '../composition/use-counter'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  setup(){
    const counter = useCounter('hello world')
    return counter
  }
}
</script>
