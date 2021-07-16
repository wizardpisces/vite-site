<template>
    <div>
        this is A
        <B v-if="check" :check="check-1"></B>
    </div>
</template>
<script lang='ts'>
import { defineAsyncComponent } from '@vue/runtime-core'
export default {
    name:'A',
     props:{
        check:Number
    },
    components:{
        B: defineAsyncComponent(()=>import('./b.vue'))
    },
    setup(props){
        return {
            check:props.check
        }
    }
}
</script>