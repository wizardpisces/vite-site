import store from "../store"

export const $t = (key:string)=>{
    if(store.state.showTranslateKey){
        return `<key>${key}`
    }
    return key
}

export const useI18N = ()=>{
    return {$t}
}