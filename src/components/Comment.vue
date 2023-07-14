<template>
  <div id="gitalk-container"></div>
</template>
<script lang="ts">
import { onMounted, ref } from "vue";
import md5 from 'md5';
import Gitalk from "gitalk";
import 'gitalk/dist/gitalk.css'

export default {
  name:"Comment",
  setup() {
    const init = () => {
      if (window) {
        let gitTalk = new Gitalk({
          id: md5(location.pathname), // 可选长度不能超过 50，这里需要做 唯一值的 hash 运算（实际是少于 50 内的 hash 运算）
          owner: "wizardpisces", // GitHub repository 所有者
          repo: "docs-comment", // GitHub repo
          clientID: "ad89973e3795c60bd06f", // clientID
          clientSecret: "c07e2402defcbfb9e99637c1120011530dd3d24c", // clientSecret
          admin: ["wizardpisces"], // GitHub repo 所有者
          labels: ["GitTalk"], // GitHub issue 标签
          proxy:"https://mellifluous-bombolone-049a57.netlify.app/github_access_token",
          // proxy:"https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token",
          // createIssueManually: false, //如果当前页面没有相应的 issue 且登录的用户属于 admin，则会自动创建 issue。如果设置为 true，则显示一个初始化页面，创建 issue 需要点击 init 按钮。
        });
        gitTalk.render("gitalk-container");

      }
    };

    onMounted(() => {
      init();
    });
  },
};
</script>
