// worker.js

// 定义一个函数，用于计算数组中所有元素的平方和
function compute(data) {
  return data.reduce((a, b) => a + b * b, 0);
}

// 监听主线程发送的数据
self.onmessage = function(e) {
  // 调用计算函数，并将结果返回给主线程
  self.postMessage(compute(e.data));
};
