import React from 'react';
import { ComputeTipProps, Item, Operator, Parentheses } from './type';
import './index.scss';

const isItem = (item: Item | Operator | Parentheses): item is Item => typeof item !== 'string';
const hasSubTitle = (title: Item['title']): title is [string,string] => typeof title !== 'string' && title.length === 2;

const ComputeTip = (tipProps: ComputeTipProps) => {
  const renderTitle = (title:Item['title']) => {
    if (hasSubTitle(title)) {
      return <div className="array-title">
        <span className="main-title">{title[0]}</span>
        <span className="sub-title">{title[1]}</span>
      </div>;
    } else {
      return title;
    }
  };
  return (
    <div className="compute-tip">
      {tipProps.map((item,index) => {
        if (isItem(item)) {
            return (
              <div className="item" key={index}>
                <span className="top">{renderTitle(item.title)}</span>
                <span className="down">{item.value}</span>
              </div>
            );
        } else { // operator 或者是 parentheses，垂直居中
          return (
            <div className="item" key={index}>
              {item}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ComputeTip;
