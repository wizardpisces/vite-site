// import logo from './logo.svg'
import { Routes, Route, Outlet, Link } from "react-router-dom";
import React from "react";
import './App.scss'
const TodoList = React.lazy(() => import('./pages/todoList/index'))
const TodoListRedux = React.lazy(() => import('./pages/todoListRedux/index'))
const TodoListMobx = React.lazy(() => import('./pages/todoListMobx/index'))

let todoRouteTuple: ([string, JSX.Element])[] = [['useReducer', <TodoList />], ['Redux', <TodoListRedux />], ['Mobx', <TodoListMobx />]]

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route key="default" index element={<Default />}></Route>
        {
          todoRouteTuple.map(routeTuple =>

            <Route key={routeTuple[0]} path={routeTuple[0]} element={
              <React.Suspense  fallback={<>...</>}>
                {routeTuple[1]}
              </React.Suspense>
            }></Route>
          )
        }
      </Route>
    </Routes>
  )
}

function Default() {
  return (
    <h1>select todoList</h1>
  )
}

function Layout() {

  return (
    <div className="App">
      <nav>
        <div className="tabs">
          {todoRouteTuple.map(routeTuple => <div className="tab" key={routeTuple[0]}><Link to={routeTuple[0]}>{routeTuple[0]}</Link></div>)}
        </div>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default App
