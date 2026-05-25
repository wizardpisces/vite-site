<template>
  <div class="comment-panel">
    <div :id="containerId"></div>
  </div>
</template>
<script lang="ts">
import { onMounted } from "vue";
import md5 from 'md5';
import Gitalk from "gitalk";
import 'gitalk/dist/gitalk.css'

export default {
  name:"Comment",
  props: {
    commentId: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const sourceId = props.commentId || location.pathname;
    const containerId = `gitalk-container-${md5(sourceId).slice(0, 8)}`;

    const init = () => {
      if (typeof window !== "undefined") {
        let gitTalk = new Gitalk({
          id: md5(sourceId), // 可选长度不能超过 50，这里需要做 唯一值的 hash 运算（实际是少于 50 内的 hash 运算）
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
        gitTalk.render(containerId);

      }
    };

    onMounted(() => {
      init();
    });

    return {
      containerId,
    };
  },
};
</script>

<style lang="scss">
.comment-panel {
  color: $color-text-primary;

  .gt-container {
    font-size: 14px;
    color: $color-text-primary;

    a,
    .gt-link {
      color: $color-text-primary;
      border-bottom: 1px solid #8a8178;

      &:hover {
        color: $color-accent;
        border-bottom-color: $color-accent;
      }
    }

    .gt-header-textarea {
      background: #fffdf8;
      border: 1px solid #d8d0c4;
      border-radius: 0;
      color: $color-text-primary;
      box-shadow: none;
    }

    .gt-header-preview {
      background: #fffdf8;
      border: 1px solid #d8d0c4;
      border-radius: 0;
    }

    .gt-btn {
      border-radius: 0;
      box-shadow: none;
    }

    .gt-btn-public,
    .gt-btn-login {
      background: #141413;
      border-color: #141413;
      color: #fff;
    }

    .gt-btn-preview {
      background: transparent;
      border-color: #d8d0c4;
      color: $color-text-secondary;
    }

    .gt-meta,
    .gt-header-meta,
    .gt-comment-content {
      border-color: #d8d0c4;
    }

    .gt-comment-content {
      background: #fffdf8;
      border-radius: 0;
      box-shadow: none;
    }

    .gt-comment-admin .gt-comment-content {
      background: #fbf8f1;
    }

    .gt-svg svg {
      fill: $color-text-secondary;
    }
  }
}
</style>
