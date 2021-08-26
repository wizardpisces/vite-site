<template>
  <div class="bookmark">
    <div
      class="directory"
      v-for="bookmark in bookmarks"
      :key="bookmark.title"
    >
      <h3>{{bookmark.title}}</h3>
      <ul>
        <li
          v-for="mark in bookmark.marks"
          :key="mark.url"
        ><a :href="mark.url">{{mark.title}}</a></li>
      </ul>
    </div>

    <div class="other-link">
      <p v-html="link"></p>
    </div>
  </div>
</template>
<script type="ts">
import {html as link} from './link.md'
export default {
  name: 'VirtualMachine',
  setup() {
    let bookmarks = [
      {
        title: '无VNode前端框架',
        marks: [
          {
            title: "solidjs",
            url: 'https://github.com/solidjs/solid'
          },
          {
            title: "svelte",
            url: "https://github.com/sveltejs/svelte"
          }
        ]
      },
      {
        title: 'VNode优化过的前端框架',
        marks: [
          {
            title: "inferno (react-like)",
            url: 'https://www.zhihu.com/question/65824137'
          },
          {
            title: "anu (react-like)",
            url: 'https://segmentfault.com/a/1190000011235844'
          }
        ]
      },
      {
        title: '博客（算法）',
        marks: [
          {
            title: "diff",
            url: 'https://github.com/NervJS/nerv/issues/3'
          }
        ]
      },
      {
        title: '博客（小程序）',
        marks: [
          {
            title: "同层渲染",
            url: 'https://developers.weixin.qq.com/community/develop/article/doc/000c4e433707c072c1793e56f5c813'
          },
          {
            title: "小程序底层实现原理及一些思考（2）",
            url: 'https://github.com/berwin/Blog/issues/49'
          },
          {
            title: "小程序底层架构展望",
            url: "https://zhuanlan.zhihu.com/p/373958625"
          }
        ]
      },
      {
        title: '工具',
        marks: [
          {
            title: "imgcook",
            url: 'https://www.imgcook.com/'
          },
          {
            title: "3D web muse",
            url: 'https://www.muse.place/'
          }
        ]
      },
    ]
    return { bookmarks,link }
  }
}
</script>
<style lang="scss">
.bookmark {
  padding:0 20px;
  ul{
    display: flex;
    flex-direction: row;
    padding:0;
    li{
      display: flex;
      margin-right: 10px;
      border-bottom:1px solid #cccc;
    }
  }
  a{
    color:#000;
    &:hover{
      color:$color-primary
    }
  }
}
</style>
