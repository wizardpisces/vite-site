export type Recursive = {
    recur: Recursive
} | number

export type Human = {
    basicInfo: {
        name: string,
        age: number
    },
    otherInfo: {
        test: string
    }
}

export type ChainReferenceNumber = {
    testChain:number
}

export type ChainReference = ChainReferenceNumber

export type TestChainReference = {
    reference: ChainReference
}

export type BasicObj = {
    arr: [],
    obj: {
        obj2: {
            
        }
    },
    optionalObj?: {
        key1: string,
        key2: number
    }
    simpleType: string
}

export type ApiSchema = {
    testArray: [],
    testChainReference: ChainReference,
    cycleReference: Recursive
    testReference: Human,
    testObject: BasicObj,
    apiSchema2: ApiSchema2
}

// type Color = "red" | "green" | "blue";
// type Shape = "circle" | "square" | "triangle";
// export type ColoredShape = Color & Shape;

// export type ApiSchema = {
//     name: string,
//     age: number,
//     otherApi: ApiSchema2
// }

export type ApiSchema2 = {
    name: string,
    age: number,
    test1: number
}