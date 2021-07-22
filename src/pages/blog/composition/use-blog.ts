import { ref } from "vue";
import { BlogDescriptor, CategoryGroup, SubHeader } from "../../../../script/blog";
import { categoryGroup } from '../../../.blog/blog-metadata'

// @ts-ignore
const blogMap: Record<string, () => Promise<any>> = import.meta.glob("/src/blog/**/*.md");

let blogContent = ref('')

let activeBlog = ref<BlogDescriptor>({
    blogTitle: 'default',
    blogLink: ''
})

let activeSubHeader = ref({
    title: ''
});

let loadingBlog = ref(false)

export default () => {

    function setBlogContent(content: string) {
        blogContent.value = content
    }

    function setActiveBlog(blogDescriptor: BlogDescriptor) {
        activeBlog.value = blogDescriptor
    }

    function setActiveSubHeader(subHeader:SubHeader){
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
        let blogDescriptor:BlogDescriptor

        function isCategory(categoryOrBlog:CategoryGroup | BlogDescriptor):boolean{
            return Object.prototype.hasOwnProperty.call(categoryOrBlog,'items')
        }

        function findBlog(categoryGroup: CategoryGroup){
            categoryGroup.items.forEach((categoryOrBlog) => {
                if (isCategory(categoryOrBlog)) {
                    // is category
                    findBlog(categoryOrBlog as CategoryGroup)
                } else{
                    // is blog
                    if (normalizeBlogTitle(categoryOrBlog.blogTitle) === normalizeBlogTitle(blogTitle)){
                         blogDescriptor = categoryOrBlog
                     }
                }
            })
        }

        findBlog(categoryGroup)

        return blogDescriptor
    }

    function normalizeBlogTitle(blogTitle:string){
        return blogTitle.toLocaleLowerCase()
    }

    function initBlogByTitle(blogTitle: string) {
        let blogDescriptor: BlogDescriptor = findBlogDescriptorByName(categoryGroup, blogTitle) as BlogDescriptor
        setActiveBlog(blogDescriptor)
        fetchBlog(blogDescriptor.blogLink)
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