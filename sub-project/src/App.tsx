// import logo from './logo.svg'
import { Routes, Route, useLocation } from "react-router-dom";
import React from "react";
import {
  TransitionGroup,
  CSSTransition
} from "react-transition-group";

import './App.scss'
import Layout from "./Layout";
const TodoList = React.lazy(() => import('./pages/todoList/index'))
const TodoListRedux = React.lazy(() => import('./pages/todoListRedux/index'))
const TodoListMobx = React.lazy(() => import('./pages/todoListMobx/index'))

export let todoRouteTuple: ([string, JSX.Element])[] = [['useReducer', <TodoList />], ['Redux', <TodoListRedux />], ['Mobx', <TodoListMobx />]]

function App() {
  let location = useLocation();
  return (

    <AnimatedRoutes>
        <Route path="/" element={<Layout />}>
          <Route key="default" index element={<Default />}></Route>
          {
            todoRouteTuple.map(routeTuple =>
              <Route key={routeTuple[0]} path={routeTuple[0]} element={
                <React.Suspense fallback={<>...</>}>
                  {routeTuple[1]}
                </React.Suspense>

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

function AnimatedRoutes({
  children,
  ...rest
}) {
  const location = useLocation();

  return (
    <TransitionGroup {...rest}>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          {children}
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

export default App
