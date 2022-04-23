// import logo from './logo.svg'
import { Routes, Route, useLocation } from "react-router-dom";
import React, { ComponentType, useRef } from "react";
import KeepAlive, { AliveScope } from 'react-activation'

import {
  TransitionGroup,
  CSSTransition
} from "react-transition-group";

import './App.scss'
import Layout from "./Layout";
const TodoList = React.lazy(() => import('./pages/todoList/index'))

// mimic delay suspense component loading
const TodoListRedux = React.lazy(() => {
  const p = new Promise<{ default: ComponentType<any> }>(resolve =>{
    setTimeout(_=>{
      resolve(import('./pages/todoListRedux/index'))
    },1000)
  })
  return p;
});

const TodoListMobx = React.lazy(() => import('./pages/todoListMobx/index'))

export let todoRouteTuple: ([string, JSX.Element])[] = [['/useReducer', <TodoList />], ['/Redux', <TodoListRedux />], ['/Mobx', <TodoListMobx />]]

function App() {
  return (
    <AnimatedRoutes>
      <Route path="/" element={<Layout />}>
        <Route key="default" index element={<Default />}></Route>
        {
          todoRouteTuple.map(routeTuple =>
            <Route key={routeTuple[0]} path={routeTuple[0]} element={
              <KeepAlive key={routeTuple[0]}>
                <React.Suspense fallback={<>loading...</>}>
                  {routeTuple[1]}
                </React.Suspense>
              </KeepAlive>
            }></Route>
          )
        }
      </Route>
    </AnimatedRoutes>

  )
}

function Default() {
  return (
    <h1>select todoList</h1>
  )
}

// TODOS: transition not working right
function AnimatedRoutes({
  children,
  ...rest
}) {
  const location = useLocation();
  return <Routes location={location} >
      {children}
    </Routes>
  return (
    <TransitionGroup {...rest}>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location} >
          {children}
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App
