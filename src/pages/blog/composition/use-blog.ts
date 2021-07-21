import { ref } from "vue";
import { BlogDescriptor } from "../../../../script/blog";
import { categoryGroup} from '../../../.blog/blog-metadata'

// @ts-ignore
const blogMap: Record<string, () => Promise<any>>  = import.meta.glob("/src/blog/**/*.md");

let blogContent = ref('')

let activeBlog = ref<BlogDescriptor>({
    blogTitle:'default',
    blogLink:''
})

export default () => {

    function setBlogContent(content:string){
        blogContent.value = content
    }

    function setActiveBlog(blogDescriptor:BlogDescriptor){
        activeBlog.value = blogDescriptor
    }

    function fetchBlog(blogLink:BlogDescriptor['blogLink']){
        return blogMap[blogLink]().then(mod=>{
            setBlogContent(mod.html)
        })
    }

    return {
        categoryGroup,
        setActiveBlog,
        blogContent,
        activeBlog,
        fetchBlog
    }
}