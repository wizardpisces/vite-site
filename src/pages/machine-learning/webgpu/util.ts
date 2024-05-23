// 导入 WebGPU 类型定义
/// <reference types="@webgpu/types" />



async function initWebGPU(): Promise<{ device: GPUDevice }> {
  if (!navigator.gpu) {
    console.error('WebGPU not supported!');
    throw new Error('WebGPU not supported!');
  }

  const adapter: GPUAdapter | null = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error('Failed to get GPU adapter!');
    throw new Error('Failed to get GPU adapter!');
  }

  const device: GPUDevice = await adapter.requestDevice();
  return { device };
}

async function createBuffers(device: GPUDevice): Promise<{ gpuBufferA: GPUBuffer, gpuBufferB: GPUBuffer, gpuBufferResult: GPUBuffer }> {
  const matrixSize = 4; // 2x2 matrix for simplicity
  const matrixA = new Float32Array([
    1, 2,
    3, 4
  ]);

  const matrixB = new Float32Array([
    5, 6,
    7, 8
  ]);

  const bufferSize = matrixA.byteLength;

  // 创建缓冲区A
  const gpuBufferA = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true // 表示在缓冲区创建时将其映射到 CPU 地址空间，这样可以在缓冲区创建后立即通过 CPU 进行读写操作。
  });
  new Float32Array(gpuBufferA.getMappedRange()).set(matrixA);
  gpuBufferA.unmap();

  // 创建缓冲区B
  const gpuBufferB = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE,
    mappedAtCreation: true
  });
  // getMappedRange() 的结果是一个 ArrayBuffer
  new Float32Array(gpuBufferB.getMappedRange()).set(matrixB); // Float32Array 是 CPU 跟 GPU 沟通的桥梁，这里是通过 CPU 对 GPU 缓冲区 B 进行写入

  /**
   * 同步性能：WebGPU 和 GPU 需要知道何时数据写入已经完成，以便可以同步操作。如果没有明确地调用 unmap()，GPU 可能不会意识到 CPU 已经完成了数据的写入，可能导致数据不一致或其他同步问题。
   * 资源管理：映射操作会在系统内存和 GPU 之间保留一个数据通道。当不再需要这个通道时，应该释放它，这样 GPU 就可以管理它的内存资源，提高效率。
   * 安全性：当缓冲区被映射时，WebGPU 禁止对其执行任何 GPU 操作，因为同时由 CPU 和 GPU 访问同一块内存可能会导致竞争条件和不可预测的结果。使用 unmap() 确保了一旦缓冲区准备好被 GPU 使用时，CPU 不会再对其进行访问
   */
  gpuBufferB.unmap(); // 断开 gpuBufferB 与 CPU 的映射，从而允许 GPU 对其进行操作。

  // 创建结果缓冲区
  const gpuBufferResult = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  return { gpuBufferA, gpuBufferB, gpuBufferResult };
}

async function createComputePipeline(device: GPUDevice): Promise<GPUComputePipeline> {
    // WebGPU Shading Language (WGSL)
  const shaderCode = `
        @group(0) @binding(0) var<storage, read> matrixA : array<f32>;
        @group(0) @binding(1) var<storage, read> matrixB : array<f32>;
        @group(0) @binding(2) var<storage, read_write> resultMatrix : array<f32>;

        @compute @workgroup_size(1)
        fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
            let index = GlobalInvocationID.x;
            let row = index / 2u;
            let col = index % 2u;

            var sum : f32 = 0.0;
            for (var i = 0u; i < 2u; i = i + 1u) {
                sum = sum + matrixA[row * 2u + i] * matrixB[i * 2u + col];
            }

            resultMatrix[index] = sum;
        }
    `;

  const shaderModule = device.createShaderModule({
    code: shaderCode
  });

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main'
    }
  });

  return pipeline;
}

export async function run() {
  const { device } = await initWebGPU();
  const { gpuBufferA, gpuBufferB, gpuBufferResult } = await createBuffers(device);
  const pipeline = await createComputePipeline(device);

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: gpuBufferA } },
      { binding: 1, resource: { buffer: gpuBufferB } },
      { binding: 2, resource: { buffer: gpuBufferResult } }
    ]
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(4);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  // Wait for the GPU task to complete
  await device.queue.onSubmittedWorkDone();

  // Read back the result
  const gpuReadBuffer = device.createBuffer({
    size: gpuBufferResult.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  const commandEncoder2 = device.createCommandEncoder();
  commandEncoder2.copyBufferToBuffer(gpuBufferResult, 0, gpuReadBuffer, 0, gpuBufferResult.size);
  device.queue.submit([commandEncoder2.finish()]);

  await gpuReadBuffer.mapAsync(GPUMapMode.READ);
  const copyArrayBuffer = gpuReadBuffer.getMappedRange();
  const result = new Float32Array(copyArrayBuffer.slice(0));
//   console.log('Result:', result);

  gpuReadBuffer.unmap();
  return result;
}

// run().catch(console.error);
