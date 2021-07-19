---
title: 从0到1实现编译器
---
#### SASS简介
[SASS](https://sass-lang.com/documentation)是css的增强扩展，让开发能够使用variables, nested rules, mixins, functions等能力去书写css;
#### 本篇目标
从零到1实现SASS编译器(将sass转为css语法)，系列文章会按照如下流程进行:

code -> AST([Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)) -> transformed AST -> transformed code

## 目标例子

输入：
```scss
$primary-color: #333;
.test{
  color: $primary-color;
}
```
输出：
```scss
.test {
    color: #333;
}
```

## Step1：定义基本的 AST 结构，可以理解为node节点的JSON表达式
### 定义AST

这里的AST定义针对例子做了简化,先看后面的运用再回过头来看定义会更好理解些：
```ts
export const enum NodeTypes {
    TEXT: "TEXT",
    VARIABLE: "VARIABLE",
    SELECTOR: "SELECTOR",
    DECLARATION: "DECLARATION",
    RULE: "RULE",
    RootNode: "RootNode",
}

interface Node {
    [key: string]: any
    type: NodeTypes
}

interface VariableNode extends Node{
    type: NodeTypes.VARIABLE
    value: string
}

interface TextNode extends Node {
    type: NodeTypes.TEXT
    value: string
}

interface SelectorNode extends Node {
    type: NodeTypes.SELECTOR
    value: TextNode
}

export interface DeclarationStatement extends Node {
    type: NodeTypes.DECLARATION
    left: VariableNode | TextNode
    right: VariableNode | TextNode
}

export interface RuleStatement extends Node {
    type: NodeTypes.RULE
    selector: SelectorNode
    children: DeclarationStatement[]
}

// RootNode 是最外层的节点类型
export interface RootNode extends Node {
    type: NodeTypes.RootNode
    children: (RuleStatement | DeclarationStatement)[]
}

```
### 源码跟AST的对应关系
根据以上的AST定义，需要解析出的节点JSON表达式应该如下所示：

```scss
$primary-color: #333;
```
需要parse成：
```json
{
    "type": "DECLARATION",
    "left": {
        "type": "VARIABLE",
        "value": "$primary-color",
    },
    "right": {
        "type": "TEXT",
        "value": "#333",
    }
}
```
---
```scss
.test{
  color: $primary-color;
}
```
需要parse成：
```json
{
      "type": "RULE",
      "selector": {
        "type": "SELECTOR",
        "value": {
          "type": "TEXT",
          "value": ".test",
        }
      },
      "children": [
        {
          "type": "DECLARATION",
          "left": {
            "type": "TEXT",
            "value": "color",
          
          },
          "right":  {
            "type": "VARIABLE",
            "value": "$primary-color",
          },
        }
      ]
    }
```

## Step2: sass字符串parse为目标 AST
目标: 实现如下的调用
```js
let ast:RootNode = parse(lexical(input_stream(sass)))
```

### 实现**input_stream**函数读取输入字符串流：
```ts
function input_stream(input: string):InputStream{
    let offset = 0, line = 1, column = 1;
     return {
        next,
        peek,
        setCoordination,
        getCoordination,
        eof
    }
    function next():string {
        let ch = input.charAt(offset++);

        if (ch == "\n") line++, column = 1; else column++;

        return ch;
    }
    // 手动设置当前位置信息
    function setCoordination(coordination: Position) {
        offset = coordination.offset;
        line = coordination.line;
        column = coordination.column;
    }

    // 获取当前读取的位置
    function getCoordination() {
        return {
            offset,
            line,
            column
        }
    }

    // 预先读取下一个字符的内容，但是不做位置移动
    function peek():string {
        return input.charAt(offset);
    }
    function eof() {
        return peek() === "";
    }
}
```

### 实现**lex**函数将字符串流转为 token 流

```ts
export type Token = {
    type: Node['type']
    value: string
}

function lex(input: InputStream):TokenStream {
    return {
        next,
        peek,
        eof
    }
    function is_whitespace(ch) {
        return " \t\n".indexOf(ch) >= 0;
    }

    // Variable的可能标识
    function is_id_start(ch) {
        return /[$]/.test(ch);
    }

  
    // declaration的可能标识
    function is_assign_char(ch) {
        return ":".indexOf(ch) >= 0;
    }

    // 普通字符串读取
    function is_base_char(ch) {
        return /[a-z0-9_\.\#\@\%\-"'&\[\]]/i.test(ch);
    }

    // sass变量名限制
    function is_id_char_limit(ch) {
        return is_id_start(ch) || /[a-z0-9_-]/i.test(ch); 
    }

    function read_assign_char():Token {
        return {
            type: NodeTypes.DECLARATION,
            value: input.next()
        }
    }

    function read_string():Token {
        /**
         * '#' end eg:
         * .icon-#{$size} {}
         */
        let str = read_end(/[,;{}():#\s]/);

        if (internalCallIdentifiers.includes(str)) {//possible internal url
            let callStr = readInternalCall(str);

            return callStr;
        }

        return {
            type: NodeTypes.TEXT,
            value: str
        };
    }

    // 根据条件限制读取消费掉尽可能多的字符
    function read_while(predicate) {
        let str = "";
        while (!input.eof() && predicate(input.peek()))
            str += input.next();
        return str;
    }

    // 产出变量 token
    function read_ident(): Token {
        let id = read_while(is_id_char_limit);
        return {
            type: NodeTypes.VARIABLE,
            value: id
        };
    }

    // 读取下一个 token 并移动位置
    function read_next(): Token {
         // 跳过空白字符
        read_while(is_whitespace);
        if (is_assign_char(ch)) return read_assign_char();
        if (is_id_start(ch)) return read_ident();
        if (is_base_char(ch)) return read_string();
    }

    //读取下一个 token，但是不改变读取游标信息，所以有先获取信息，读取token后还原位置信息
    function ll(n = 1): Token {
        let coordination = input.getCoordination()
        let tok = read_next();
        input.setCoordination(coordination)
        return tok;
    }

    // 预测下一个 Token 类型
    function peek(n = 1): Token {
        return ll(n);
    }

    function next(): Token {
        return read_next();
    }

}
```
#### 字符流转换Token流的结果：

```js
{ type: 'VARIABLE', value: '$primary-color' }
{ type: 'DECLARATION', value: ':' }
{ type: 'TEXT', value: '#333' }
{ type: 'PUNC', value: ';' }
{ type: 'TEXT', value: '.test' }
{ type: 'PUNC', value: '{' }
{ type: 'TEXT', value: 'color' }
{ type: 'DECLARATION', value: ':' }
{ type: 'VARIABLE', value: '$primary-color' }
{ type: 'PUNC', value: ';' }
{ type: 'PUNC', value: '}' }
```

可以看出token一般用<type, value>形似的二元组来表示，type表示一个Token种类，value为属性值（一般是源码相关的字符串）

### 实现**parse**函数将**Token**流转为AST语法树：

**Token流**到AST([Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree))语法树的生成,
可以在[astexplorer](https://astexplorer.net/)体验下各种源码跟 AST 的映射关系

```ts

function parse(input: LexicalStream) {

    function delimited(start: puncType, stop: puncType, separator: puncType, parser: Function) {// FIFO
        let statements: any[] = [], first = true;

        skipPunc(start);

        while (!input.eof()) {
            if (isPuncToken(stop)) break;
            if (first) {
                first = false;
            } else {
                if (separator === ';') {
                    skipPuncSilent(separator)
                } else {
                    skipPunc(separator);
                }
            }
            if (isPuncToken(stop)) break;

            statements.push(parser());
        }
        skipPunc(stop);

        return statements;
    }

    // Token的解析分发

    function dispatchParser() {
        // predict 下一个Token的类型来判定下一步的解析
        let tok = input.peek();

        // VARIABLE类型就直接返回Token作为语法树的一部分，（说明 VARIABLE既可以是Token的类型，也可以是AST Node类型）
        if (tok.type === NodeTypes.VARIABLE) {
            return input.next();
        }

        // 同上
        if (tok.type === NodeTypes.PUNC) {
            return input.next()
        }

        if (tok.type === NodeTypes.TEXT) {
            return input.next()
        }
    }

    // 解析 DECLARATION 节点
    function parseDeclaration(left: DeclarationStatement['left']): DeclarationStatement {
        input.next(); // skip ':'
        return {
            type: NodeTypes.DECLARATION,
            left: left,
            // 读取 Text value
            right: input.next()
        }
    }

    // 解析 RULE节点
    function parseRule(selector: RuleStatement['selector']): RuleStatement {
        let children = delimited("{", "}", ";", parseStatement);
        return {
            type: NodeTypes.RULE,
            selector,
            children
        }
    }

    // 通过predict下一个 Token类型来判断解析的 AST Node类型
    function maybeDeclaration(exp) {
        let expr = exp();
         if (isAssignToken()) {
            if (expr.type === NodeTypes.VARIABLE) {
                return parseDeclaration(expr)
            }
         }
        if (isPuncToken('{')) {
            return parseRule({
                type: NodeTypes.SELECTOR,
                value: expr
            }) //passin selector
        }

        return expr;
    }

    // 基础 Statement节点的 parser
    function parseStatement() {
        return maybeDeclaration(function () {
            return dispatchParser()
        })
    }

    // parse 入口的 children，可以参见上一篇的 RootNode节点定义
    function parsechildren(): Statement[] {
        let children: Statement[] = [];
        while (!isEnd()) {
            children.push(parseStatement());
            skipPuncSilent(";");
        }
        return children
    }

    // parser的入口
    function parseProgram(): RootNode {
        return {
            type: NodeTypes.RootNode,
            children: parsechildren()
        }
    }
    return parseProgram()
}
```

#### parse出源码(sass源代码)对应的抽象语法树如下:

```json
{
  "type": "RootNode",
  "children": [
    {
      "type": "DECLARATION",
      "left": {
        "type": "VARIABLE",
        "value": "$primary-color"
      },
      "right": {
        "type": "TEXT",
        "value": "#333"
      }
    },
    {
      "type": "RULE",
      "selector": {
        "type": "SELECTOR",
        "value": {
          "type": "TEXT",
          "value": ".test"
        }
      },
      "children": [
        {
          "type": "DECLARATION",
          "left": {
            "type": "TEXT",
            "value": "color"
          },
          "right": {
            "value": {
              "type": "VARIABLE",
              "value": "$primary-color"
            }
          }
        }
      ]
    }
  ]
}
```

可以看出是由最开始定义 的AST节点组合而成

## 结语

以上是伪代码，实际会比这个复杂一些，
比如还需要考虑很多：
1. 节点位置信息存储，方便做source-map
2. 节点所属文件信息，会有模块依赖关系整理
3. ...
### [源码查看](https://github.com/wizardpisces/tiny-sass-compiler)
目前工程实现的功能：
### sass基本特性:

1. Variables
2. Nesting
3. Extend/Inheritance
4. Operators
5. Mixins
6. Modules

### 编译流程:
1. 词法分析
2. 语法分析
3. AST优化转换
4. 源码生成(+sourceMap)）

最后预祝大家元旦快乐。。

预告下一篇：[实现Transform 把源码(sass)关联的AST转换为目标代码(css)关联的 AST]()


[原文地址](https://juejin.cn/post/6910037343026020359)