// src/ComB.js
import React from 'react';
import { SharedStateFields, useSharedState } from './SharedStateContext';

const ComB = () => {
  const [sharedValue] = useSharedState(SharedStateFields.ComAComB);

  return (
    <div>
      <h5>Component B</h5>
      <p>Shared Value: {sharedValue}</p>
    </div>
  );
};

export default ComB;
