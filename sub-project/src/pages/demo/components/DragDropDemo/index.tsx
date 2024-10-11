import './index.css';

import React, { useState } from 'react';
export const DragDropDemo = () => {
  const [draggedItem, setDraggedItem] = useState(-1);
  const [onDragOverItem, setOnDragOverItem] = useState(-1);
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4']);

  // 当拖动开始时，保存拖动的项的索引
  const handleDragStart = (event: any, index: number) => {
    setDraggedItem(index);
    console.log(event.target);
    event.dataTransfer.effectAllowed = 'move'; // 设置拖动的效果
    const dragIcon = document.createElement('div');
    dragIcon.className = 'drag-move-element';
    // dragIcon.style.width = '100px';
    // dragIcon.style.height = '100px';
    // dragIcon.style.backgroundColor = 'lightgreen';
    // dragIcon.style.border = '2px dashed red';
    // dragIcon.style.opacity = '0.7'; // 设置透明度
    // dragIcon.style.position = 'absolute';
    // dragIcon.style.top = '-1000px'; // 隐藏在屏幕外，不显示在页面中

    document.body.appendChild(dragIcon); // 将它添加到文档中

    // 设置自定义的拖动影像，偏移值可以调整以适应视觉效果
    event.dataTransfer.setDragImage(dragIcon, 50, 50);
  };

  // 在拖动经过目标时，允许放置
  const handleDragOver = (event: any, index: number) => {
    event.preventDefault();
    // event.dataTransfer.dropEffect = 'move'; // 指示可以移动
    setOnDragOverItem(index);
    event.target?.classList.add('drag-hovered');
  };

  const handleDragLeave = (event: any, index: number) => {
    event.preventDefault();
    event.target?.classList.remove('drag-hovered');
  };

  // 处理放置事件，更新列表顺序
  const handleDrop = (event: any, index: number) => {
    event.preventDefault();
    const newItems = [...items];
    const dragged = newItems[draggedItem];
    newItems.splice(draggedItem, 1); // 删除拖动的项
    newItems.splice(index, 0, dragged); // 插入到新位置
    setItems(newItems);
    event.target?.classList.remove('drag-hovered');
    setDraggedItem(-1); // 清空拖动的状态
    setOnDragOverItem(-1);
  };

  return (
    <div>
      <h3>Drag and Drop Example</h3>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={(event) => handleDragOver(event, index)}
            onDragLeave={(event) => handleDragLeave(event, index)}
            onDrop={(event) => handleDrop(event, index)}
            style={{
              padding: '8px',
              margin: '4px',
              width: '100px',
              backgroundColor:
                onDragOverItem === index ? 'lightgreen' : 'lightgrey',
              border: '1px solid black',
              cursor: 'move',
              transition: 'transform 0.3s ease'
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DragDropDemo;
