import fm from 'front-matter'
import MarkdownIt, { Options as MarkdownOptions } from 'markdown-it'
import { parseDocument, DomUtils } from 'htmlparser2'
import { Element, Text } from 'domhandler'
import { Plugin } from 'vite'
import renderDom from 'dom-serializer'

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

type HItem = { level: string; content: string }

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
        ele.attribs['id'] = '#'+hName

        // inject hash link to blog content
        let newEle = new Element('a', { href: '#' + hName }, undefined)
        // DomUtils.appendChild(newEle,new Text('#'))
        DomUtils.prependChild(ele, newEle)

        hList.push({
            level: ele.tagName.replace('h', ''),
            content: hName,
        })
    })

    return {
        attributes: fmContent.attributes,
        html: renderDom(rootDom),
        // html,
        hList
    }
}

export const plugin = (options: PluginOptions = {}): Plugin => {
    return {
        name: 'vite-plugin-markdown2html',
        enforce: 'pre',
        transform(code, id) {
            if (!id.endsWith('.md')) return null
            let metadata = createMarkdown2HtmlMetadata(code, options.markdownIt || {})
            const content = new ExportedContent()
            content.addContext(`const attributes = ${JSON.stringify(metadata.attributes)}`)
            content.addExporting('attributes')

            // serialize injected hash html
            content.addContext(`const html = ${JSON.stringify(metadata.html)}`)
            content.addExporting('html')

            content.addContext(`const hList = ${JSON.stringify(metadata.hList)}`)
            content.addExporting('hList')

            return {
                code: content.export()
            }
        },
    }
}


/**
 *  [ {level:1}, {level:2}, {level:3}, {level:2}, {level:4}, {level:2} ] =>
 *  [
 *      [ {level:1}, {level:2}, {level:3} ],
 *      [ {level:2}, {level:4} ],
 *      [ {level:2} ]
 *  ]
 */

export function createLayer(layerList: { level: string; content: string }[]) {
    if (!layerList.length) return []
    let result: HItem[][] = []
    let tmp: HItem[] = [layerList[0]]
    layerList.slice(1).forEach(layer => {
        if (tmp[tmp.length - 1].level < layer.level) {
            tmp.push(layer)
        } else {
            result.push(tmp)
            tmp = [layer]
        }
    })
    return result
}

export default plugin