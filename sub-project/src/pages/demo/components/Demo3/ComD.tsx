// src/ComD.js
import React from 'react';
import { SharedStateFields, useComCComD, useSharedState } from './SharedStateContext';

const ComD = () => {
  // const [sharedValue] = useSharedState(SharedStateFields.ComCComD);
  const [sharedValue, updateSharedValue] = useComCComD();

  return (
    <div>
      <h5>Component D</h5>
      <p>Shared Value: {sharedValue}</p>
    </div>
  );
};

export default ComD;
