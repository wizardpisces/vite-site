import * as path from 'path'
import * as fs from 'fs'
import glob from 'fast-glob'
import fm from 'front-matter'

export type SubHeader = {
    subTitle: string
    // sub header link
    link: string
}

// one blog
export type BlogItem = {
    blogTitle: string
    // blogContent: Promise<any>
    blogLink: string // import() path
    subHeaders?: SubHeader[]
}

// same dir with one categoryName, may have nested dirs
export type CategoryGroup = {
    // isCategory == true
    categoryName: string
    items: (BlogItem | CategoryGroup)[]
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

async function createLinkCollect() {
    let blogRelatives = await globMarkdown()
    let linkCollect: Record<string, any> = {}
    blogRelatives.forEach((relativePath: string) => {
        let importPath = `/src/blog/${relativePath}`

        let pathSplited: string[] = relativePath.split('/')

        pathSplited.reduce((res: any, cur: string) => {
            if (!res[cur]) {
                res[cur] = {}
                if (cur.endsWith('.md')) {
                    res[cur] = importPath
                }
            }
            return res[cur]
        }, linkCollect)
    });
    return linkCollect
}


type FormatContentType = {
    title:string
    description?:string
}
async function createGroupItem(blogLink: string, blogTitle: string) {
    let blogPath = path.join(root,blogLink.substring('/src'.length))
    let content = fs.readFileSync(blogPath,'utf-8')
    let formatedContent = fm<FormatContentType>(content)
    debug('formatedContent',formatedContent.attributes)
    if(formatedContent.attributes.title){
        blogTitle = formatedContent.attributes.title
    }

    return {
        blogTitle: blogTitle,
        blogLink: blogLink,
        subHeaders: [
            // { subTitle: 'subtitle1', link: 'subheader link' },
            // { subTitle: 'subtitle2', link: 'subheader link' },
            // { subTitle: 'subtitle3', link: 'subheader link' },
        ]
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
    debug('running blog metadata generation')

    let linkCollect: Record<string, any> = await createLinkCollect()

    let categoryGroup: CategoryGroup = await createCategoryGroup(linkCollect)

    let source = `
    /* auto generated, should not be manually changed */
    const linkCollect = ${JSON.stringify(linkCollect)};
    const categoryGroup = ${JSON.stringify(categoryGroup)};
    export {
        linkCollect,
        categoryGroup
    }`

    fs.writeFileSync(path.join(root, '.blog/blog-metadata.ts'), source)
}

write()
