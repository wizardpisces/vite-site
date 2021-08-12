# Domain Specific Language

## Virtual-dom
虚拟dom操作集合

1. creat VNode-A （简称 v-a）
2. create Dom-A (简称 d-a) from v-a
3. change v-a to v-b
4. diff v-a and v-b to patches
5. patch d-a from patches
6. continue 3

```javascript
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');


function render(count)  {
    return h('div', {}, [String(count)]);
}

// 2: Initialise the document
var count = 0;      // We need some app data. Here we just store a count.
var tree = render(count);              // 1: 创建 VNode
var rootNode = createElement(tree);     // 2. 生成实际的 DOM
document.body.appendChild(rootNode);  // 3. 挂载
count++;
var newTree = render(count);
var patches = diff(tree, newTree); // VNode diff
rootNode = patch(rootNode, patches); // Patch
```
### Tools
* [html2hscript](https://github.com/twilson63/html2hscript) - Parse HTML into hyperscript 
* [html2hscript.herokuapp.com](http://html2hscript.herokuapp.com/) - Online Tool that converts html snippets to hyperscript
* [html2hyperscript](https://github.com/unframework/html2hyperscript) - Original commandline utility to convert legacy HTML markup into hyperscript
### Reference
* [hyperscript](https://github.com/hyperhype/hyperscript)
* [virtual-dom](https://github1s.com/Matt-Esch/virtual-dom/blob/HEAD/README.md)
* [snabbdom](https://github.com/snabbdom/snabbdom)
## HTML Manipulation

```ts
import MarkdownIt from 'markdown-it'
import { parseDocument, DomUtils } from 'htmlparser2'
import renderDom from 'dom-serializer'
import { Element } from 'domhandler'

let html = new MarkdownIt(options).render(mdContent)
const rootDom = parseDocument(html) // parse dom to JSON so we can easily manipulate

// inject hash tag to header tag
let hElements = rootDom.children.filter(
        rootSibling => rootSibling instanceof Element && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rootSibling.tagName)
    ) as Element[]

hElements.forEach(ele => {
    let hName = DomUtils.textContent(ele)
    ele.attribs['id'] = hName
    // inject hash link
    let newEle = new Element('a', { href: '#' + hName }, undefined)
    DomUtils.prependChild(ele, newEle)
})

html = renderDom(rootDom) // serialize json dom to string

document.body.appendChild(html);  // 挂载

```

### Ecosystem

| Name                                                          | Description                                             |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| [htmlparser2](https://github.com/fb55/htmlparser2)            | Fast & forgiving HTML/XML parser                        |
| [domhandler](https://github.com/fb55/domhandler)              | Handler for htmlparser2 that turns documents into a DOM |
| [domutils](https://github.com/fb55/domutils)                  | Utilities for working with domhandler's DOM             |
| [css-select](https://github.com/fb55/css-select)              | CSS selector engine, compatible with domhandler's DOM   |
| [cheerio](https://github.com/cheeriojs/cheerio)               | The jQuery API for domhandler's DOM                     |
| [dom-serializer](https://github.com/cheeriojs/dom-serializer) | Serializer for domhandler's DOM                         |

## Webpack

```ts
const parser = require('@babel/parser')
import traverse from '@babel/traverse'
const babel = require('@babel/core')

// parse to json
const ast = parser.parse(content, {
    sourceType: 'module'
  })
const dependencies: Record<string, string> = {}

// traverse with type visitor hooks to manipulate
traverse(ast, {
    ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        const newFile = path.join(dirname, node.source.value)

        // collect file dependecies
        dependencies[node.source.value] = newFile
    }
})

// code generation from json
const { code } = babel.transformFromAstSync(ast, content, {
    presets: ["@babel/preset-env"]
})!

```

## 总结

一般compiler操作集合：

1. parse raw string to VNode
2. traverse VNode (visitor hooks with manipulation: insert , remove, modify, replace etc )
3. code generation or Serialize VNode to string