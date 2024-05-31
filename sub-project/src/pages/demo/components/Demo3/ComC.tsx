// src/ComC.js
import React from 'react';
import { SharedStateFields, useComCComD, useSharedState } from './SharedStateContext';

const ComC = () => {
  // const [sharedValue, updateSharedValue] = useSharedState(SharedStateFields.ComCComD);
  const [sharedValue, updateSharedValue] = useComCComD();

  return (
    <div>
      <h5>Component C</h5>
      <input
        type="text"
        value={sharedValue}
        onChange={(e) => updateSharedValue(e.target.value)}
        placeholder="Type something..."
      />
    </div>
  );
};

export default ComC;
