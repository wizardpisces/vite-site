// test.ts

import { MockMethod } from 'vite-plugin-mock'
import urlMap from '../../src/url'
import { Todo } from '../../src/pages/todoListRedux/store-v2/reducers/todoListSlice'
import { todoListMockData } from './data'

enum Status {
    SUCCESS,
    FAIL
}

export type MockResponse<T> = {
    status: Status,
    data: T
}

export default [
    {
        url: urlMap.genTodoListUrl(),
        method: 'get',
        timeout:1000, // deplay 1s
        response: (): MockResponse<Todo[]> => {
            let res = {
                status: Status.SUCCESS,
                data:todoListMockData
            }
            return res
            // return new Promise(resolve => setTimeout(() => resolve(res), 1000))
        },
    }
] as MockMethod[]