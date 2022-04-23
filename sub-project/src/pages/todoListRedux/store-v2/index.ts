import { createStore, combineReducers } from "redux";
import { configureStore } from '@reduxjs/toolkit'

import todoListReducer from './reducers/todoListSlice'
import testReducer from './reducers/testSlice'

import {
  persistStore, persistReducer, PersistConfig, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const rootReducer = combineReducers({ testReducer, todoListReducer });

export type AppState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<AppState> = {
  key: "TODO_REDUX_STORAGE_KEY",
  storage,
  whitelist: ['todoListReducer']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,

  // reference: https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch