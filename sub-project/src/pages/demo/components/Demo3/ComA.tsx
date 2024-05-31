// src/ComA.js
import React from 'react';
import { SharedStateFields, useSharedState } from './SharedStateContext';

const ComA = () => {
  const [sharedValue, updateSharedValue] = useSharedState(SharedStateFields.ComAComB);

  return (
    <div>
      <h5>Component A</h5>
      <input
        type="text"
        value={sharedValue}
        onChange={(e) => updateSharedValue(e.target.value)}
        placeholder="Type something..."
      />
    </div>
  );
};

export default ComA;
