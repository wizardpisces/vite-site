import path from 'path'
import glob from 'fast-glob'
import fs from 'fs'

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

async function write() {
    let blogRelatives = await globMarkdown()

    let blogList = blogRelatives.map((relativePath:string) => {
        return {
            name: relativePath,
            value: import(`${root}/blog/${relativePath}.md`),
        };
    });
    let source = `
    /* auto generated, should not be manually changed */
    const blogs = ${JSON.stringify(blogList)};
    export {
        blogs
    }`
    fs.writeFileSync(path.join(root, 'constants.ts'), source)
}

write()