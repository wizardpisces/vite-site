import { ref } from "vue";
import { NestedHItem, NestedHList, Md2HtmlExports } from "vite-plugin-md2html";

export default composition

export type SubHeader = {
    title: string
    // sub header link
    link: string
    children: SubHeader[]
}

// one blog
export type BlogDescriptor = {
    blogTitle: string
    blogContent?: string
    blogLink: string // import() path
    subHeaders?: SubHeader[]
}

// same dir with one categoryName, may have nested dirs
export type CategoryGroup = {
    // isCategory == true
    categoryName: string
    items: (BlogDescriptor | CategoryGroup)[]
}

export type BlogTree = {
    [key: string]: string | BlogTree
}

const debug = (...args: any[]) => console.log.apply(null, ['group-generation.ts:'].concat(args))

// @ts-ignore
const blogMap: Record<string, () => Promise<any>> = import.meta.glob("/src/blog/**/*.md");

function createBlogTree(): BlogTree {
    let blogTree: BlogTree = {}

    function generateImportRelatives() {
        return Object.keys(blogMap).map(importPath => {
            return importPath.split('src/blog/')[1]
        })
    }

    generateImportRelatives().forEach((relativePath: string) => {
        let chain = blogTree
        let importPath = `/src/blog/${relativePath}`
        let pathSections: string[] = relativePath.split('/')

        pathSections.forEach((pathSection: string) => {
            if (!chain[pathSection]) {
                if (pathSection.endsWith('.md')) {
                    chain[pathSection.replace('.md', '')] = importPath
                }else{
                    chain[pathSection] = {}
                }
            }
            chain = chain[pathSection] as BlogTree
        })
    });

    return blogTree
}


function createBlogDescriptor(blogLink: string, blogTitle: string): BlogDescriptor {
    return {
        blogTitle: blogTitle,
        blogLink: blogLink,
        subHeaders: [] // lazy load subHeaders bt dynamic import
    }
}

function createCategoryGroup(categoryDir: Record<string, any>, categoryName: string = 'blog') {
    let group: CategoryGroup = {
        categoryName: categoryName,
        items: []
    }

    Object.keys(categoryDir).forEach(async key => {
        if (typeof categoryDir[key] === 'string') {
            group.items.push(createBlogDescriptor(categoryDir[key], key))
        } else {
            group.items.push(createCategoryGroup(categoryDir[key], key))
        }
    })

    return group
}

function findBlogDescriptorByBlogTitleOrBlogLink(blogTitle: string = '', blogLink: string = ''): BlogDescriptor {
    let blogDescriptor: BlogDescriptor
    function isCategory(categoryOrBlog: CategoryGroup | BlogDescriptor): boolean {
        return Object.prototype.hasOwnProperty.call(categoryOrBlog, 'items')
    }

    function isBlog(categoryOrBlog: CategoryGroup | BlogDescriptor): boolean {
        return Object.prototype.hasOwnProperty.call(categoryOrBlog, 'blogTitle')
    }

    function normalizeStr(str: string) {
        return str.toLocaleLowerCase()
    }

    function findBlogByTitle(innnerCategoryGroup: CategoryGroup) {
        innnerCategoryGroup.items.forEach((categoryOrBlog) => {
            if (isCategory(categoryOrBlog)) {
                // is category
                findBlogByTitle(categoryOrBlog as CategoryGroup)
            } else if (isBlog(categoryOrBlog)) {
                // is blog
                if (
                    normalizeStr((categoryOrBlog as BlogDescriptor).blogTitle) === normalizeStr(blogTitle)
                    || normalizeStr((categoryOrBlog as BlogDescriptor).blogLink) === normalizeStr(blogLink)
                ) {
                    blogDescriptor = categoryOrBlog as BlogDescriptor
                }

            }
        })
    }
    findBlogByTitle(categoryGroup.value)

    return blogDescriptor!
}

export function findBlogDescriptorByBlogLink(blogLink: string) {
    return findBlogDescriptorByBlogTitleOrBlogLink('', blogLink)
}
export function findBlogDescriptorByBlogTitle(blogTitle: string) {
    return findBlogDescriptorByBlogTitleOrBlogLink(blogTitle)
}

export function findSubHeaderByTitle(title: string, subHeaders: SubHeader[] = activeBlog.value.subHeaders || []): SubHeader {
    let subHeader: SubHeader | null = null;
    function findSubHeaderFromSubHeaders(subHeaders: SubHeader[]) {
        subHeaders?.forEach(header => {
            if (header.title === title) {
                subHeader = header
            } else {
                findSubHeaderFromSubHeaders(header.children)
            }
        })
    }

    findSubHeaderFromSubHeaders(subHeaders)

    if (subHeader) {
        return subHeader
    } else {
        return activeSubHeader.value
    }
}

function updateBlogDescriptor(blogDescriptor: BlogDescriptor, meta: Md2HtmlExports) {
    function createSubHeader(hItem: NestedHItem): SubHeader {
        return {
            title: hItem.title,
            // level:hItem.level
            link: '#' + hItem.title,
            children: []
        }
    }

    function createSubHeaders(nestedHList: NestedHList): SubHeader[] {
        let subHeaders: SubHeader[] = []
        nestedHList.forEach((nestedHItem: NestedHItem) => {
            let subHeader: SubHeader = createSubHeader(nestedHItem)
            subHeader.children = createSubHeaders(nestedHItem.children)
            subHeaders.push(subHeader)
        })
        return subHeaders
    }

    blogDescriptor.subHeaders = createSubHeaders(meta.nestedHeaders)
    blogDescriptor.blogContent = meta.html

}

let blogTree = createBlogTree()
let categoryGroup = ref<CategoryGroup>(createCategoryGroup(blogTree)),
    activeBlog = ref<BlogDescriptor>({
        blogTitle: 'blog',
        blogLink: '',
        blogContent: '',
        subHeaders: []
    }),
    activeSubHeader = ref<SubHeader>({
        title: '',
        link: '',
        children: []
    }),
    blogContent = ref(''),
    loadingBlog = ref(false);
debug(blogTree,categoryGroup)

function composition() {
    function setBlogContent(content: string) {
        blogContent.value = content
    }

    function setActiveBlog(blogDescriptor: BlogDescriptor) {
        activeBlog.value = blogDescriptor
    }

    function setActiveSubHeader(subHeader: SubHeader) {
        activeSubHeader.value = subHeader
    }

    async function fetchMetaByBlogLink(blogLink: BlogDescriptor['blogLink']) {
        loadingBlog.value = true
        return blogMap[blogLink]().then((meta: Md2HtmlExports )=> {
            let blogDescriptor = findBlogDescriptorByBlogLink(blogLink)
            updateBlogDescriptor(blogDescriptor, meta)
            setActiveBlog(blogDescriptor)
            setBlogContent(meta.html)
            loadingBlog.value = false
            return meta
        })
    }

    async function initBlogByTitle(blogTitle: string, blogHash: string) {
        let blogDescriptor: BlogDescriptor = findBlogDescriptorByBlogTitle(blogTitle) as BlogDescriptor
        return fetchMetaByBlogLink(blogDescriptor.blogLink).then(meta => {
            if (blogHash) {
                setActiveSubHeader(findSubHeaderByTitle(blogHash.substring(1), activeBlog.value.subHeaders))
            }
        })
    }

    return {
        categoryGroup,
        activeBlog,
        activeSubHeader,
        blogContent,
        setActiveBlog,
        setActiveSubHeader,
        fetchMetaByBlogLink,
        initBlogByTitle,
        loadingBlog,
    }
}