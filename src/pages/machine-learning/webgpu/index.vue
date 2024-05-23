<template>
  <div id="webgpu">
    <h1>matrix multiply</h1>
    <h2>input:</h2>
    <br/>
     matrixA<br/>[
      1, 2,
      <br/>
       3, 4
    ];
  <br/>
   matrixB <br/>[
      5, 6,
      <br/>
       7, 8
    ];
    <br/>
    <h2>output:</h2>
matrixA * matrixB = [{{ result }}]
  </div>
</template>
<script lang="ts">
import {run } from './util'

export default {
  async setup(props) {
    let result = await run().catch(console.error);
   
    return {
      result
    };
  },
};

</script>