export type Recursive = {
    recur: Recursive
} | number

export type Human = {
    basicInfo: {
        name: string,
        age: number
    },
    otherInfo: {

    }
}

export type ChainReferenceNumber = {
    testChain:number
}
export type ChainReference = ChainReferenceNumber

export type ApiSchema = {
    testArray: [],
    testChainReference: ChainReference,
    testReference: Human,
    testObject: {
        arr: [],
        optionalObj?: {
            key1: string,
            key2: number
        }
        simpleType: string
    },
}

// type Color = "red" | "green" | "blue";
// type Shape = "circle" | "square" | "triangle";
// export type ColoredShape = Color & Shape;

// export type ApiSchema = {
//     name: string,
//     age: number,
//     otherApi: ApiSchema2
// }

// export type ApiSchema2 = {
//     name: string,
//     age: number
// }