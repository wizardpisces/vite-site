import { ref } from "vue";
import { BlogDescriptor, CategoryGroup } from "../../../../script/blog";
import { categoryGroup } from '../../../.blog/blog-metadata'

// @ts-ignore
const blogMap: Record<string, () => Promise<any>> = import.meta.glob("/src/blog/**/*.md");

let blogContent = ref('')

let activeBlog = ref<BlogDescriptor>({
    blogTitle: 'default',
    blogLink: ''
})

let loadingBlog = ref(false)

export default () => {

    function setBlogContent(content: string) {
        blogContent.value = content
    }

    function setActiveBlog(blogDescriptor: BlogDescriptor) {
        activeBlog.value = blogDescriptor
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

        function findBlog(categoryGroup: CategoryGroup){
            categoryGroup.items.forEach((categoryOrBlog) => {
                if (categoryOrBlog.categoryName) {
                    // is category
                    findBlog(categoryOrBlog as CategoryGroup)
                } else if (categoryOrBlog.blogTitle) {
                    // is blog
                     if(categoryOrBlog.blogTitle === blogTitle){
                         blogDescriptor = categoryOrBlog
                     }
                }
            })
        }

        findBlog(categoryGroup)

        return blogDescriptor
    }

    function initBlogByTitle(blogTitle: string) {
        let blogDescriptor: BlogDescriptor = findBlogDescriptorByName(categoryGroup, blogTitle) as BlogDescriptor
        setActiveBlog(blogDescriptor)
        fetchBlog(blogDescriptor.blogLink)
    }

    return {
        categoryGroup,
        setActiveBlog,
        blogContent,
        activeBlog,
        initBlogByTitle,
        fetchBlog,
        loadingBlog
    }
}