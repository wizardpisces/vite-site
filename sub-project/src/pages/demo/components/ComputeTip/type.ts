export type Item = { title: string | string[]; value: string }; // [title,subTitle]
export type Operator = '=' | 'x' | '÷' | '-';
export type Parentheses = '(' | ')';
export type ComputeTipPropsItem = Item | Operator | Parentheses;
export type ComputeTipProps = ComputeTipPropsItem[];
