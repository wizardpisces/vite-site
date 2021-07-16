import path from 'path'
import glob from 'fast-glob'
import fs from 'fs'

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

export type SubHeader = {
    subTitle: string
    // sub header link
    link: string
}

// one blog
export type BlogItem = {
    blogTitle: string
    // blogContent: Promise<any>
    blogContent: string // import() path
    subHeaders?: SubHeader[]
}

// same dir with one categoryName, may have nested dirs
export type CategoryGroup = {
    // isCategory == true
    categoryName: string
    items: (BlogItem | CategoryGroup)[]
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
        let importPath = `/src/blog/${relativePath}?import`

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

function createGroupItem(blogContent: string, blogTitle: string) {
    return {
        blogTitle: 'blog title: ' + blogTitle,
        blogContent: blogContent,
        subHeaders: [
            { subTitle: 'subtitle1', link: 'subheader link' },
            { subTitle: 'subtitle2', link: 'subheader link' },
            { subTitle: 'subtitle3', link: 'subheader link' },
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