export type ApiSchema = {
    testArray: [],
    testObject: {
        arr: [],
        obj: {
            name: string,
            age: number
        },
        optionalObj?: {
            key1: string,
            key2: number
        }
        simpleType: string
    },
}
