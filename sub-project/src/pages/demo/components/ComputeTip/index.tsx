import { ComputeTipProps, Item, Operator, Parentheses } from './type';
import style from './index.module.scss'

const isItem = (item: Item | Operator | Parentheses): item is Item => typeof item !== 'string';
const hasSubTitle = (title: Item['title']): title is [string,string] => typeof title !== 'string' && title.length === 2;

const ComputeTip = (tipProps: ComputeTipProps) => {
  const renderTitle = (title:Item['title']) => {
    if (hasSubTitle(title)) {
      return <div className={style.arrayTitle}>
        <span className={style.mainTitle}>{title[0]}</span>
        <span className={style.subTitle}>{title[1]}</span>
      </div>;
    } else {
      return title;
    }
  };
  return (
    <div className={style.computeTip}>
      {tipProps.map((item,index) => {
        if (isItem(item)) {
            return (
              <div className={style.item} key={index}>
                <span className={style.top}>{renderTitle(item.title)}</span>
                <span className={style.down}>{item.value}</span>
              </div>
            );
        } else { // operator 或者是 parentheses，垂直居中
          return (
            <div className={style.item} key={index}>
              {item}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ComputeTip;
