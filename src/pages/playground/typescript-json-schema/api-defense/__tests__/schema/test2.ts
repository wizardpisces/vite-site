// 同名覆盖 test.ts 中的 ApiSchema2
// export type ApiSchema2 = {
//     name: string,
//     age: number
// }

import { ApiSchema2 } from "./test"

export type ApiSchema3 = {
    apiSchema2: ApiSchema2
}

export type ApiSchema4 = ApiSchema2