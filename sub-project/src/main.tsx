import React from "react";
import ReactDOM from "react-dom";
import KeepAlive, { AliveScope } from 'react-activation'

import { BrowserRouter } from "react-router-dom";
import "./index.scss";
import App from "./App";

type Props = {
  container?: HTMLElement;
};

function render(props: Props) {
  let container = document.getElementById("root");
  if (props.container) {
    container = props.container;
  }
  
  ReactDOM.render(
    <React.StrictMode>
      <AliveScope>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AliveScope>
    </React.StrictMode>,
    container
  );
}

// qiankunWindow.customxxx = "test custom";

// if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
//   console.log("not running in sub app react");
//   render({});
// }

// renderWithQiankun({
//   mount(props = {}) {
//     console.log("mount");
//     render(props);
//   },
//   bootstrap() {
//     console.log("bootstrap");
//   },
//   unmount(props: Props) {
//     console.log("unmount");
//     const { container } = props;
//     // @ts-ignore
//     ReactDOM.unmountComponentAtNode( container ? container.querySelector("#root") : document.querySelector("#root")
//     );
//   },
// });



//@ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
  console.log("not running in sub app react");
  render({});
}

export async function bootstrap() {
  console.log("[react16] react app bootstraped");
}

export async function mount(props: Props) {
  console.log("[react16] props from main framework", props);
  render(props);
}

export async function unmount(props: Props) {
  const { container } = props;
  // @ts-ignore
  ReactDOM.unmountComponentAtNode(container ? container.querySelector("#root") : document.querySelector("#root")
  );
}