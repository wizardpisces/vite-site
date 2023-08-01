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

export type OnErrorOptions = {
    msg: string,
    type?: ValidateAndFixAPIError,
    schema?: Record<string, any>,
    data?: Record<string, any>,
    errorDetail?: any
}
