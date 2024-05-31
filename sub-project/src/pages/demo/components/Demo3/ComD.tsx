// src/ComD.js
import React from 'react';
import { SharedStateFields, useSharedState } from './SharedStateContext';

const ComD = () => {
  const [sharedValue] = useSharedState(SharedStateFields.ComCComD);

  return (
    <div>
      <h5>Component D</h5>
      <p>Shared Value: {sharedValue}</p>
    </div>
  );
};

export default ComD;
