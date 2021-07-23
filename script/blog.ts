import * as path from 'path'
import * as fs from 'fs'
import glob from 'fast-glob'
import { createMarkdown2HtmlMetadata, NestedHList, NestedHItem } from '../plugins/vite-plugin-markdown2html'

export type SubHeader = {
    title: string
    // sub header link
    link: string
    children: SubHeader[]
}

// one blog
export type BlogDescriptor = {
    blogTitle: string
    // blogContent: Promise<any>
    blogLink: string // import() path
    subHeaders?: SubHeader[]
}

// same dir with one categoryName, may have nested dirs
export type CategoryGroup = {
    // isCategory == true
    categoryName: string
    items: (BlogDescriptor | CategoryGroup)[]
}

const debug = (...args: any[]) => console.log.apply(null, ['blog.ts:'].concat(args))

const root = path.join(process.cwd(), 'src')

function globMarkdown(pattern = "**/*.md") {
    return glob(pattern, {
        cwd: path.join(root, 'blog'),
        ignore: [
            '**/node_modules/**',
            `**/__tests__/**`
        ],
        // absolute: true
    })
}

/**
 * root dir，
 * blogs must be categorized under one dir,
 * which means root dir only contains dirs
 */

type BlogTree = {
    [key: string]: string | BlogTree
}
async function createBlogTree(): Promise<BlogTree> {
    let blogRelatives = await globMarkdown()
    let blogTree: BlogTree = {}

    blogRelatives.forEach((relativePath: string) => {
        let chain = blogTree
        let importPath = `/src/blog/${relativePath}`
        let pathSections: string[] = relativePath.split('/')

        pathSections.forEach((pathSection: string) => {
            if (!chain[pathSection]) {
                chain[pathSection] = {}
                if (pathSection.endsWith('.md')) {
                    chain[pathSection] = importPath
                }
            }
            chain = chain[pathSection] as BlogTree
        })
    });

    return blogTree
}

async function createGroupItem(blogLink: string, blogTitle: string) {
    let blogPath = path.join(root, blogLink.substring('/src'.length))
    let content = fs.readFileSync(blogPath, 'utf-8')
    let metadata = createMarkdown2HtmlMetadata(content)

    if (metadata.attributes.title) {
        blogTitle = metadata.attributes.title
    }

    function createSubHeader(hItem: NestedHItem):SubHeader {
        return {
            title: hItem.title,
            // level:hItem.level
            link: '#' + hItem.title,
            children: []
        }
    }
    function createSubHeaders(nestedHList: NestedHList):SubHeader[] {
        let subHeaders: SubHeader[] = []
        nestedHList.forEach((nestedHItem: NestedHItem) => {
            let subHeader: SubHeader = createSubHeader(nestedHItem)
            subHeader.children = createSubHeaders(nestedHItem.children)
            subHeaders.push(subHeader)
        })
        return subHeaders
    }
    let subHeaders: SubHeader[] = createSubHeaders(metadata.nestedHeaders)

    // debug(metadata.hList)
    // debug(metadata.nestedHList)
    // debug(subHeaders)
    return {
        blogTitle: blogTitle,
        blogLink: blogLink,
        subHeaders: subHeaders
    }
}

async function createCategoryGroup(categoryDir: Record<string, any>, categoryName: string = 'blog') {
    let group: CategoryGroup = {
        categoryName: categoryName,
        items: []
    }

    Object.keys(categoryDir).forEach(async key => {
        if (typeof categoryDir[key] === 'string') {
            group.items.push(await createGroupItem(categoryDir[key], key))
        } else {
            group.items.push(await createCategoryGroup(categoryDir[key], key))
        }
    })

    return group
}


async function write() {
    let s = Date.now()
    debug(`start blog metadata generation`)

    let blogTree: Record<string, any> = await createBlogTree()

    let categoryGroup: CategoryGroup = await createCategoryGroup(blogTree)

    let source = `
    /* auto generated, should not be manually changed */
    const blogTree = ${JSON.stringify(blogTree)};
    const categoryGroup = ${JSON.stringify(categoryGroup)};
    export {
        blogTree,
        categoryGroup
    }`

    fs.writeFileSync(path.join(root, '.blog/blog-metadata.ts'), source)

    debug(`end blog metadata generation in ${Date.now() - s}ms`)

}

write()
