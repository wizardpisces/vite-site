import fm from 'front-matter'
import MarkdownIt, { Options as MarkdownOptions } from 'markdown-it'
import { parseDocument, DomUtils } from 'htmlparser2'
import { Element, Text } from 'domhandler'
import { Plugin } from 'vite'
import renderDom from 'dom-serializer'

export type HItem = { level: number; title: string }
export interface NestedHItem extends HItem {
    children: NestedHItem[]
}

export type NestedHList = NestedHItem[]
export interface PluginOptions {
    markdownIt?: MarkdownOptions
}

class ExportedContent {
    #exports: string[] = []
    #contextCode = ''

    addContext(contextCode: string): void {
        this.#contextCode += `${contextCode}\n`
    }

    addExporting(exported: string): void {
        this.#exports.push(exported)
    }

    export(): string {
        return [this.#contextCode, `export { ${this.#exports.join(', ')} }`].join('\n')
    }
}

/**
 *  let hList = [ {level:1}, {level:2}, {level:2}, {level:3}, {level:2}, {level:4}]
 *  let nestedHeaders = createNestedHList(hList); 
 * [
    [
        {
            level: 1,
            children: [
                { level: 2 },
                {
                    level: 2,
                    children: [{ level: 3 }]
                }
            ]
        }
    ],
    [
        { 
            level: 2, 
            children: [{ level: 4 }] 
        }
    ]
]
 */

export function createNestedHList(hList: HItem[]): NestedHList {
    if (!hList.length) return []

    let nestedHeaders: NestedHItem[] = hList.map(h => {
        return {
            ...h,
            children: [],
        }
    })

    let prevHItem = nestedHeaders[0]
    let prevChildren: NestedHList = prevHItem.children
    let rootNestedHeaders: NestedHList = [prevHItem]

    // 标记是否在第一层，如果是，那么对于 level 相等的情况则需要 用 rootNestedHeaders push
    let inRootChildren = true;

    nestedHeaders.slice(1).forEach((curHItem) => {
        if (prevHItem.level < curHItem.level) {
            prevChildren = prevHItem.children
            prevChildren.push(curHItem)
            prevHItem = curHItem
            inRootChildren = false
        } else if (prevHItem.level === curHItem.level) {
            if (inRootChildren){
                rootNestedHeaders.push(curHItem)
            }else{
                prevChildren.push(curHItem)
            }
            prevHItem = curHItem
        } else if (prevHItem.level > curHItem.level) {
            rootNestedHeaders.push(curHItem)
            prevHItem = curHItem
            inRootChildren = true
        }
    })

    return rootNestedHeaders
}

export function createMarkdown2HtmlMetadata(code: string, options: MarkdownOptions = { html: true }) {
    let fmContent = fm<Record<string, any>>(code)
    const html = new MarkdownIt(options).render(fmContent.body)
    const rootDom = parseDocument(html)
    let hElements = rootDom.children.filter(
        rootSibling => rootSibling instanceof Element && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rootSibling.tagName)
    ) as Element[]

    let hList: HItem[] = []

    hElements.forEach(ele => {
        let hName = DomUtils.textContent(ele)
        ele.attribs['id'] = hName

        // inject hash link to blog content
        let newEle = new Element('a', { href: '#' + hName }, undefined)
        // DomUtils.appendChild(newEle,new Text('#'))
        DomUtils.prependChild(ele, newEle)

        hList.push({
            level: parseInt(ele.tagName.replace('h', '')),
            title: hName
        })
    })

    return {
        attributes: fmContent.attributes,
        html: renderDom(rootDom),
        nestedHeaders: createNestedHList(hList)
    }
}

function markdown2html(code: string, options: PluginOptions = {}) {
    let metadata = createMarkdown2HtmlMetadata(code, options.markdownIt || {})
    const content = new ExportedContent()
    content.addContext(`const attributes = ${JSON.stringify(metadata.attributes)}`)
    content.addExporting('attributes')

    // serialize injected hash html
    content.addContext(`const html = ${JSON.stringify(metadata.html)}`)
    content.addExporting('html')

    content.addContext(`const nestedHeaders = ${JSON.stringify(metadata.nestedHeaders)}`)
    content.addExporting('nestedHeaders')
    return content.export()
}

export const plugin = (options: PluginOptions = {}): Plugin => {
    return {
        name: 'vite-plugin-markdown2html',
        enforce: 'pre',
        transform(code, id) {
            if (!id.endsWith('.md')) return null
            return {
                code: markdown2html(code, options)
            }
        }
    }
}

export default plugin