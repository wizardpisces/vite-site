import { createStore, combineReducers } from "redux";
import { configureStore } from '@reduxjs/toolkit'

import {testSlice,todoListSlice} from './reducers'

import {
  persistStore, persistReducer, PersistConfig, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const rootReducer = combineReducers({ testSlice, todoListSlice });

export type AppState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<AppState> = {
  key: "TODO_REDUX_STORAGE_KEY",
  storage,
  whitelist:['todoListSlice']
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