import {
    ref,
    onMounted
} from 'vue';

export default (title:string)=>{
    const count = ref(0);
    const add = ()=>{
        count.value++
    }

    onMounted(()=>{
        console.log(`${title} mounted `)
    })

    return {
        add,
        count
    }
}