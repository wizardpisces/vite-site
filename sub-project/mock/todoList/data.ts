import { Todo } from '../../src/pages/todoListRedux/store-v2/reducers/todoListSlice'

function genTodoList() {
    let list = [
        {
            id: 1,
            task: "Give dog a bath",
            complete: true,
        },
        {
            id: 2,
            task: "Do laundry",
            complete: true,
        },
        {
            id: 3,
            task: "Vacuum floor",
            complete: false,
        },
        {
            id: 4,
            task: "Feed cat",
            complete: true,
        },
        {
            id: 5,
            task: "Change light bulbs",
            complete: false,
        },
        {
            id: 6,
            task: "Go to Store",
            complete: true,
        },
    ];
    let i = list.length;
    while (i < 50) {
        list.push({
            id: ++i,
            task: `task ${i}`,
            complete: false
        })
    }
    return list
}

export let todoListMockData: Todo[] = genTodoList() 
