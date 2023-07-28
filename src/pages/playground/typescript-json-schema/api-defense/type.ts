export type Response<T> = {
    data: T
    code: number
}

export enum ValidateAndFixAPIError {
    TypeMismatch = 'TypeMismatch',
    Required = 'Required',
    SchemaContainsRecursiveReference = 'SchemaContainsRecursiveReference',
    Other = 'Other',
}