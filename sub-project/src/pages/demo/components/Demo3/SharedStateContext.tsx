// src/SharedStateContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// 定义枚举
export enum SharedStateFields {
  ComAComB = 'comAComB',
  ComCComD = 'comCComD',
  ComEComF = 'comEComF'
}

// 定义状态类型
interface SharedState {
  [SharedStateFields.ComAComB]: string;
  [SharedStateFields.ComCComD]: string;
  [SharedStateFields.ComEComF]: string;
}

// 定义上下文类型
interface SharedStateContextType {
  state: SharedState;
  setSharedValue: (field: SharedStateFields, value: string) => void;
}

// 创建上下文
const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

export const SharedStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SharedState>({
    [SharedStateFields.ComAComB]: '',
    [SharedStateFields.ComCComD]: '',
    [SharedStateFields.ComEComF]: ''
  });

  const setSharedValue = (field: SharedStateFields, value: string) => {
    setState(prevState => ({ ...prevState, [field]: value }));
  };

  return (
    <SharedStateContext.Provider value={{ state, setSharedValue }}>
      {children}
    </SharedStateContext.Provider>
  );
};

// 自定义钩子
export const useSharedState = (field: SharedStateFields): [string, (value: string) => void] => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  const { state, setSharedValue } = context;
  const sharedValue = state[field];
  const updateSharedValue = (value: string) => setSharedValue(field, value);

  return [sharedValue, updateSharedValue];
};
