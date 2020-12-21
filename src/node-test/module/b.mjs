let b = {
    fn: () => console.log(1)
}

setTimeout(() => b.fn = () => console.log(2), 1000)

export default b