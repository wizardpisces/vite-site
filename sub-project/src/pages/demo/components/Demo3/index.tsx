// src/App.js
import React from 'react';
import { SharedStateProvider } from './SharedStateContext';
import ComA from './ComA';
import ComB from './ComB';
import ComC from './ComC';
import ComD from './ComD';

const App = () => {
  return (
    <SharedStateProvider>
      <h2>share state</h2>
      <div>
        <div style={{ display: 'flex' }}>
          <ComA />
          <ComB />
        </div>
        <div style={{ display: 'flex' }}>
          <ComC />
          <ComD />
        </div>
      </div>
    </SharedStateProvider>
  );
};

export default App;
