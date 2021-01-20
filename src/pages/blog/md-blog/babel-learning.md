Babel的解析引擎：

Babel 使用的引擎是 babylon，babylon 并非由 babel 团队自己开发的，而是 fork 的 acorn 项目，acorn 的项目本人在很早之前在兴趣部落 1.0 在构建中使用，为了是做一些代码的转换，是很不错的一款引擎，不过 acorn 引擎只提供基本的解析 ast 的能力，遍历还需要配套的 acorn-travesal, 替换节点需要使用 acorn-，而这些开发，在 Babel 的插件体系开发下，变得一体化了

Babel

1. Babel-parse
2. Babel-traverse
3. Babel-plugins
4. Babel-template
5. Babel-generator
6. Babel-register，动态编译

