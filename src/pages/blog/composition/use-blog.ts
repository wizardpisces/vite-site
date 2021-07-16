import { categoryGroup} from '../../../.blog-temp-data'

type BlogItem = {
    originalName: string;
    name: string;
    value: () => Promise<any>;
};

// @ts-ignore
const modules = import.meta.glob("../../../blog/**/*.md");
console.log('modules', modules)
const blogMap: Record<string, () => Promise<any>> = modules;

const blogList: BlogItem[] = Object.keys(modules).reduce(
    (list: BlogItem[], originalName) => {
        // @ts-ignore
        let blogName = originalName.match(/\/([^\/]+).md$/)[1];

        blogMap[blogName] = blogMap[originalName];

        list.push({
            originalName,
            name: blogName,
            value: modules[originalName],
        });
        return list;
    },
    []
);

export default () => {

    return {
        blogList,
        blogMap,
        categoryGroup
    }
}