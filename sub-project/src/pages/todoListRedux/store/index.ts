import { createStore, combineReducers } from "redux";
import {todoList,test} from "./reducers";
import { persistStore, persistReducer,PersistConfig } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

export type Todo = {
  id: number;
  task: string;
  complete: boolean;
};

const rootReducer = combineReducers({ todoList, test });

export type AppState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<AppState> = {
  key: "TODO_REDUX_STORAGE_KEY",
  storage,
  whitelist:['todoList']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

let store = createStore(persistedReducer);
let persistor = persistStore(store)
export {
  store,
  persistor
};
