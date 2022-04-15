// test.ts

import { MockMethod } from 'vite-plugin-mock'
import { data } from './data'
import urlMap from '../src/url'

enum Status{
    SUCCESS,
    FAIL
}

export type MockResponse<T> = {
    status:Status,
    data:T
}

export default [
    {
        url: urlMap.genTodoListUrl(),
        method: 'get',
        response: () => {
            return {
                status: Status.SUCCESS,
                data
            }
        },
    }
] as MockMethod[]