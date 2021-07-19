import { ref, watch } from "vue";
import { BlogItem } from "../../../../script/blog";

import { categoryGroup} from '../../../.blog/blog-metadata'

// type BlogItem = {
//     originalName: string;
//     name: string;
//     value: () => Promise<any>;
// };

// // @ts-ignore
// const modules = import.meta.glob("../../../blog/**/*.md");
// console.log('modules', modules)
// const blogMap: Record<string, () => Promise<any>> = modules;

// const blogList: BlogItem[] = Object.keys(modules).reduce(
//     (list: BlogItem[], originalName) => {
//         // @ts-ignore
//         let blogName = originalName.match(/\/([^\/]+).md$/)[1];

//         blogMap[blogName] = blogMap[originalName];

//         list.push({
//             originalName,
//             name: blogName,
//             value: modules[originalName],
//         });
//         return list;
//     },
//     []
// );

let blogContent = ref('')

let activeBlog = ref<BlogItem>({
    blogTitle:'default',
    blogLink:''
})

export default () => {

    function setBlogContent(content:string){
        blogContent.value = content
    }

    function setActiveBlog(blog:BlogItem){
        activeBlog.value = blog
    }

    return {
        categoryGroup,
        setBlogContent,
        setActiveBlog,
        blogContent,
        activeBlog
    }
}