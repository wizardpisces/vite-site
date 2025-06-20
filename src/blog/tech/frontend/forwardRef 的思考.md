# 为什么 ref 没法直接传递？
可能原因：

1. **封装**：React 强调组件的封装，即组件应该管理和控制自己的状态和行为。`ref` 是访问组件内部 DOM 节点的一种方式，如果 `ref` 能够像普通的 prop 那样传递，那么组件的内部节点就可以被外部的父组件随意访问和修改，这破坏了封装性。

2. **所有权原则**：在 React 中，每个 `ref` 有一个拥有者 —— 创建它的组件。这个原则确保了 `ref` 的使用是明确和可控的。如果 `ref` 能够像普通的 prop 那样自由传递，那么它的所有权就会变得模糊，可能导致不同组件意外地共享对同一个 DOM 节点的引用。

3. **抽象泄漏**：组件应该暴露出一个明确的 API，而 `ref` 直接关联到 DOM 节点或组件实例，这意味着组件的内部实现细节被暴露给了父组件。这种抽象泄漏可能会导致父组件过分依赖子组件的内部结构，使得重构变得困难。

4. **使用 `forwardRef` 的明确性**：通过 `forwardRef` 明确地传递 `ref`，组件库的作者可以决定哪些内部元素可以被父组件访问。这样做可以确保 `ref` 的使用是有意为之，并且对组件的内部结构有清晰的认识。

总之，`ref` 没法直接传递是为了保持组件的封装性，维护组件间清晰的边界，并确保组件的抽象不被破坏。当需要将 `ref` 传递给子组件时，React 提供了 `forwardRef` API 作为一种明确和有控制的方式来实现这一点。

## 简单实现
```jsx
function forwardRef(render) {
  return class extends React.Component {
    render() {
      // 该组件接收一个特殊的属性 `ref`，并将其传递给 render 函数
      // 这样，父组件传递给这个组件的 ref 将直接连接到 render 函数中的相应元素上
      return render(this.props, this.props.forwardedRef);
    }
  };
}

// 使用上面定义的简化版 forwardRef
const FancyButton = forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// 父组件中
class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.buttonRef = React.createRef();
  }

  componentDidMount() {
    console.log(this.buttonRef.current); // <button> DOM 节点
  }

  render() {
    // 注意我们使用了 `forwardedRef` 而不是 `ref`
    return <FancyButton forwardedRef={this.buttonRef}>Click me!</FancyButton>;
  }
}
```

在这个简化的实现中，`forwardRef` 函数返回一个新的组件，这个组件接收一个特殊的属性 `forwardedRef`。这个属性是父组件传递下来的 `ref`。然后，`forwardRef` 函数中的类组件将 `forwardedRef` 作为参数传递给 `render` 函数。

在 `Parent` 组件中，我们创建了一个 ref (`this.buttonRef`) 并将其作为 `forwardedRef` 属性传递给 `FancyButton`。因为 `FancyButton` 是用我们的简化版 `forwardRef` 创建的，它能够接收并使用这个 `ref`。

这个简化的实现演示了 `forwardRef` 的核心概念，但请注意，这并不是 React 实际上如何实现 `forwardRef` 的。React的实现包含更多的细节和优化，以确保正确处理生命周期方法、hooks 等。如果你想要在生产环境中使用 `forwardRef`，请使用 React 提供的官方 `forwardRef` API。