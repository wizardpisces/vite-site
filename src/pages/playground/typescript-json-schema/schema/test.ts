// type Recursive = {
//     recur: Recursive
// } | number

// export type ApiSchema = {
//     testArray: Recursive
// }   
// export type ApiSchema = {
//     testArray: [],
//     testObject: {
//         arr: [],
//         obj: {
//             name: string,
//             age: number,
//             recursive: Recursive
//         },
//         optionalObj?: {
//             key1: string,
//             key2: number
//         }
//         simpleType: string
//     },
// }

export type ApiSchema = {
    name: string,
    age: number,
    otherApi: ApiSchema2
}

export type ApiSchema2 = {
    name: string,
    age: number
}