import { ref } from "vue";
import { BlogDescriptor, CategoryGroup, SubHeader } from "../../../../script/blog";
import { categoryGroup as rawCategoryGroup } from '../../../.blog/blog-metadata'

// @ts-ignore
const blogMap: Record<string, () => Promise<any>> = import.meta.glob("/src/blog/**/*.md");

let blogContent = ref('')

let activeBlog = ref<BlogDescriptor>({
    blogTitle: 'default',
    blogLink: '',
    subHeaders:[]
})

let activeSubHeader = ref<SubHeader>({
    title: '',
    link:'',
    children:[]
});

let categoryGroup = ref<CategoryGroup>(rawCategoryGroup)

let loadingBlog = ref(false)

function composition(){

    function setBlogContent(content: string) {
        blogContent.value = content
    }

    function setActiveBlog(blogDescriptor: BlogDescriptor) {
        activeBlog.value = blogDescriptor
    }

    function setActiveSubHeader(subHeader: SubHeader) {
        activeSubHeader.value = subHeader
    }

    function fetchBlog(blogLink: BlogDescriptor['blogLink']) {
        loadingBlog.value = true
        return blogMap[blogLink]().then(mod => {
            setBlogContent(mod.html)
            loadingBlog.value = false
        })
    }

    function findBlogDescriptorByName(categoryGroup: CategoryGroup, blogTitle: string): BlogDescriptor {
        let blogDescriptor: BlogDescriptor

        function isCategory(categoryOrBlog: CategoryGroup | BlogDescriptor): boolean {
            return Object.prototype.hasOwnProperty.call(categoryOrBlog, 'items')
        }

        function isBlog(categoryOrBlog: CategoryGroup | BlogDescriptor): boolean {
            return Object.prototype.hasOwnProperty.call(categoryOrBlog, 'blogTitle')
        }

        function findBlog(categoryGroup: CategoryGroup) {
            categoryGroup.items.forEach((categoryOrBlog) => {
                if (isCategory(categoryOrBlog)) {
                    // is category
                    findBlog(categoryOrBlog as CategoryGroup)
                } else if (isBlog(categoryOrBlog)) {
                    // is blog
                    if (normalizeBlogTitle((categoryOrBlog as BlogDescriptor).blogTitle) === normalizeBlogTitle(blogTitle)) {
                        blogDescriptor = categoryOrBlog as BlogDescriptor
                    }
                }
            })
        }

        findBlog(categoryGroup)

        return blogDescriptor!
    }

    function normalizeBlogTitle(blogTitle: string) {
        return blogTitle.toLocaleLowerCase()
    }

    function findSubHeaderByTitle(title: string): SubHeader {
        let subHeaders = activeBlog.value.subHeaders || [],
            subHeader: SubHeader | null = null;
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

    function initBlogByTitle(blogTitle: string, blogHash: string) {
        let blogDescriptor: BlogDescriptor = findBlogDescriptorByName(categoryGroup.value, blogTitle) as BlogDescriptor
        setActiveBlog(blogDescriptor)
        if (blogHash) {
            setActiveSubHeader(findSubHeaderByTitle(blogHash.substring(1)))
        }
        return fetchBlog(blogDescriptor.blogLink)
    }

    return {
        categoryGroup,
        activeBlog,
        activeSubHeader,
        blogContent,
        setActiveBlog,
        setActiveSubHeader,
        fetchBlog,
        initBlogByTitle,
        loadingBlog,
    }
}

export default composition

// // @ts-ignore
// if (import.meta.hot) {
//     // @ts-ignore
//     import.meta.hot.accept(['../../../.blog/blog-metadata'],(mod)=>{
//         console.log(mod[0].categoryGroup)
//         categoryGroup.value = mod[0].categoryGroup
//     })
// }