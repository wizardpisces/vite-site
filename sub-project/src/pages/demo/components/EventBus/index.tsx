import { Child1 } from "./child1"
import { Child2 } from "./child2"

export const Communication = () => {
  return<>
  <h1>跨组件交流的 EventBus</h1>
    <Child1 />
    <Child2 />
  </>
}