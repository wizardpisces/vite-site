// 同名覆盖 test.ts 中的 ApiSchema2
// export type ApiSchema2 = {
//     name: string,
//     age: number
// }

import { ApiSchema2 } from "./test"

export type ApiSchema3 = {
    apiSchema2: ApiSchema2
    apiSchema4: ApiSchema4
}

export type Arr = string[]
export type Simple = string
export type Simple2 = boolean
export type ApiSchema4 = ApiSchema2

export type ApiSchema5 = number | string
export type ApiSchema6 = ApiSchema2 | ApiSchema4
export type ApiSchema7 = ApiSchema3 | number

export type ApiSchemaWhole = ApiSchema7