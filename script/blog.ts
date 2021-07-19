import path from 'path'
import fs from 'fs'
import glob from 'fast-glob'

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

function createGroupItem(blogLink: string, blogTitle: string) {
    return {
        blogTitle: 'blog title: ' + blogTitle,
        blogLink: blogLink,
        subHeaders: [
            // { subTitle: 'subtitle1', link: 'subheader link' },
            // { subTitle: 'subtitle2', link: 'subheader link' },
            // { subTitle: 'subtitle3', link: 'subheader link' },
        ]
    }
}
function createCategoryGroup(categoryDir: Record<string, any>, categoryName: string = 'blog') {
    let group: CategoryGroup = {
        categoryName: `categoryName: ` + categoryName,
        items: []
    }

    Object.keys(categoryDir).forEach(key => {
        if (typeof categoryDir[key] === 'string') {
            group.items.push(createGroupItem(categoryDir[key], key))
        } else {
            group.items.push(createCategoryGroup(categoryDir[key], key))
        }
    })

    return group
}


async function write() {
    let linkCollect: Record<string, any> = await createLinkCollect()

    let categoryGroup: CategoryGroup = createCategoryGroup(linkCollect)

    let source = `
    /* auto generated, should not be manually changed */
    const linkCollect = ${JSON.stringify(linkCollect)};
    const categoryGroup = ${JSON.stringify(categoryGroup)};
    export {
        linkCollect,
        categoryGroup
    }`

    fs.writeFileSync(path.join(root, '.blog-temp-data.ts'), source)
}

write()
