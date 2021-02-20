<template>
  <div>
    <h1>{{ msg }}</h1>
    <klk-button size = 'small' @click="add">count is: {{ count }}</klk-button>
    <router-link to="/blog/vue-ssr">Vue ssr</router-link>
    <router-view />
  </div>
</template>

<script>
import useCounter from './composition/use-counter'
export default {
  name: 'Menu',
  props: {
    msg: String
  },
  setup(props) {
    const { add, count } = useCounter(props.msg)
    return {
      add,
      count
    }
  }
}
</script>
