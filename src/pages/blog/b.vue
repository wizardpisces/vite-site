<template>
    <div>
        this is B
        <A v-if="check" :check="check-1"></A>
    </div>
</template>
<script lang="ts">
import { defineAsyncComponent } from '@vue/runtime-core'

export default {
    name:'B',
    props:{
        check:Number
    },
    components:{
        A: defineAsyncComponent(()=>import('./a.vue'))
    },
    setup(props){
        return {
            check: props.check
        }
    }
}
</script>