
type Next<T = void> = (err?: Error | null) => void;
type RequestHandler<T, U, V = void> = (
    req: T,
    res: U,
    next: Next<V>
) => V;

type Handler<T, U, V = void> = RequestHandler<T, U, V>

type Handle = RequestHandler<any, any, void>

type LayerOptions = {
    handle: Handle;
    url: string
}