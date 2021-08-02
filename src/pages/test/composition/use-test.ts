import {ref} from 'vue'

export default () => {
    let profileInterval:any = null,
        bigTaskRunedTimes = ref(0);
    
    function createBigObj() {
        let len = 20000,
            obj: Record<number, number> = {};
        while (len--) {
            obj[len] = Math.random();
        }

        return obj
    }

    function cloneBigObjTask() {
        let obj = createBigObj(),
            cloneObj: Record<number, number> = {}
        for (let key in obj) {
            cloneObj[key] = obj[key]
        }
    }

    function runBigTask() {
        let num = 100
        while (num--) {
            cloneBigObjTask()
        }
    }

    function runBigTask2() {
        let num = 50
        while (num--) {
            cloneBigObjTask()
        }
    }

    function onProfileClick() {
        if (!profileInterval) {
            profileInterval = setInterval(() => {
                bigTaskRunedTimes.value++;
                // run bigtask every second
                if(Math.random()>0.5){
                    runBigTask()
                }else{
                    runBigTask2()
                }
            }, 1000);
        } else {
            clearInterval(profileInterval);
            profileInterval = null;
        }
    }

    return {
        onProfileClick,
        bigTaskRunedTimes
    }
}