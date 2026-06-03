import { ref } from "vue";
import { NestedHItem, NestedHList, Md2HtmlExports } from "vite-plugin-md2html";
import blogFreshnessByLink from "virtual:blog-freshness";
import type { BlogFreshness } from "virtual:blog-freshness";

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
    blogFreshness: BlogFreshness
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

const UNKNOWN_BLOG_FRESHNESS: BlogFreshness = {
    status: 'unknown',
    changedAt: 0,
    commitHash: '',
    source: 'unknown',
}

const BLOG_FRESHNESS_STATUS_ORDER: Record<BlogFreshness['status'], number> = {
    added: 0,
    modified: 1,
    unknown: 2,
}

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
        blogFreshness: blogFreshnessByLink[blogLink] || UNKNOWN_BLOG_FRESHNESS,
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

function findBlogDescriptorByBlogTitleOrBlogLink(blogTitle: string = '', blogLink: string = ''): BlogDescriptor | undefined {
    let blogDescriptor: BlogDescriptor | undefined
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

    return blogDescriptor
}

export function findBlogDescriptorByBlogLink(blogLink: string) {
    return findBlogDescriptorByBlogTitleOrBlogLink('', blogLink)
}
export function findBlogDescriptorByBlogTitle(blogTitle: string) {
    return findBlogDescriptorByBlogTitleOrBlogLink(blogTitle)
}

function normalizeRouteParam(routeParam: string) {
    try {
        return decodeURIComponent(routeParam)
    } catch {
        return routeParam
    }
}

function blogRouteParamToBlogLink(routeParam: string) {
    const normalizedRouteParam = normalizeRouteParam(routeParam).replace(/\.md$/, '')

    return `/src/blog/${normalizedRouteParam}.md`
}

function blogLinkToRouteParam(blogLink: string) {
    return blogLink
        .replace('/src/blog/', '')
        .replace(/\.md$/, '')
}

export function createBlogRoutePath(blogDescriptor: BlogDescriptor) {
    return `/blog/${encodeURIComponent(blogLinkToRouteParam(blogDescriptor.blogLink))}`
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

function isCategory(categoryOrBlog: CategoryGroup | BlogDescriptor): categoryOrBlog is CategoryGroup {
    return Object.prototype.hasOwnProperty.call(categoryOrBlog, 'items')
}

function collectBlogDescriptors(categoryGroup: CategoryGroup): BlogDescriptor[] {
    return categoryGroup.items.flatMap((categoryOrBlog) => {
        if (isCategory(categoryOrBlog)) {
            return collectBlogDescriptors(categoryOrBlog)
        }

        return [categoryOrBlog]
    })
}

function compareBlogFreshness(left: BlogDescriptor, right: BlogDescriptor) {
    const leftFreshness = left.blogFreshness || UNKNOWN_BLOG_FRESHNESS
    const rightFreshness = right.blogFreshness || UNKNOWN_BLOG_FRESHNESS
    const changedAtDiff = rightFreshness.changedAt - leftFreshness.changedAt

    if (changedAtDiff !== 0) {
        return changedAtDiff
    }

    const statusDiff = BLOG_FRESHNESS_STATUS_ORDER[leftFreshness.status] - BLOG_FRESHNESS_STATUS_ORDER[rightFreshness.status]

    if (statusDiff !== 0) {
        return statusDiff
    }

    return left.blogTitle.localeCompare(right.blogTitle, 'zh-Hans-CN')
}

let blogTree = createBlogTree()
let categoryGroup = ref<CategoryGroup>(createCategoryGroup(blogTree)),
    activeBlog = ref<BlogDescriptor>({
        blogTitle: 'blog',
        blogLink: '',
        blogContent: '',
        blogFreshness: UNKNOWN_BLOG_FRESHNESS,
        subHeaders: []
    }),
    activeSubHeader = ref<SubHeader>({
        title: '',
        link: '',
        children: []
    }),
    blogContent = ref(''),
    loadingBlog = ref(false);
// debug(blogTree,categoryGroup)

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
            if (!blogDescriptor) {
                throw new Error(`Blog not found: ${blogLink}`)
            }
            updateBlogDescriptor(blogDescriptor, meta)
            setActiveBlog(blogDescriptor)
            setBlogContent(meta.html)
            loadingBlog.value = false
            return meta
        })
    }

    async function initBlogByTitle(blogTitle: string, blogHash: string) {
        let blogDescriptor = findBlogDescriptorByBlogLink(blogRouteParamToBlogLink(blogTitle)) || findBlogDescriptorByBlogTitle(blogTitle)
        if (!blogDescriptor) {
            return Promise.reject(new Error(`Blog not found: ${blogTitle}`))
        }
        return fetchMetaByBlogLink(blogDescriptor.blogLink).then(meta => {
            if (blogHash) {
                setActiveSubHeader(findSubHeaderByTitle(blogHash.substring(1), activeBlog.value.subHeaders))
            }
        })
    }

    function getLatestBlogs(limit: number = 8) {
        return collectBlogDescriptors(categoryGroup.value)
            .filter((blogDescriptor) => blogDescriptor.blogTitle !== 'Introduction')
            .sort(compareBlogFreshness)
            .slice(0, limit)
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
        getLatestBlogs,
        loadingBlog,
    }
}
