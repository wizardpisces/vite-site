<template>
  <div class="sass-playground">
    <div class="editor">
      <div class='source-editor'>
        <div class="head-scss">
          <span>SCSS</span>
          <span class="info-scss">This is <a
              href="https://github.com/wizardpisces/tiny-sass-compiler"
              target="__blank"
            >Tiny-Sass-Compiler</a>'s Demo</span>
        </div>
        <div
          class="content"
          ref="sassRef"
        >

        </div>
      </div>
      <!-- <span
        role="presentation"
        class="Resizer vertical "
      ></span> -->
      <div class="dist-editor">
        <div class="head-css">CSS</div>
        <div
          class="content"
          ref="cssRef"
        >

        </div>
      </div>
      <!-- <div :class="astEditorCls">
        <div class="head">scss related ast</div>
        <div
          class="content"
          ref="precompileAstRef"
        >

        </div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import Code from "./composition/use-code.js";
export default {
  name: "SassPlayground",
  setup(props, ctx) {
    const astEditorCls = ref("hidden");
    const { sassRef, cssRef, precompileAstRef } = Code();

    onMounted(() => {
      console.log("sass playground mounted!");
    });

    function toggleAst() {
      if (astEditorCls.value === "hidden") {
        astEditorCls.value = "dist-precompile-ast-editor";
      } else {
        astEditorCls.value = "hidden";
      }
    }

    return {
      sassRef,
      cssRef,
      precompileAstRef,
      toggleAst,
      astEditorCls,
    };
  },
};
</script>
<style lang="scss" scoped>
// @import url("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/codemirror.min.css");
@import url("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.57.0/theme/mdn-like.min.css");
.sass-playground {
  width: 100%;
  height: 700px;
  position: relative;
  display: flex;
  flex-direction: column;

  .hidden {
    display: none;
  }
  .pannel {
    width: 100%;
    height: 50px;
    background: sienna;
    display: flex;
    flex-direction: row-reverse;
  }
  .editor {
    flex: 1;
    display: flex;
    height: 100%;
    flex-direction: row;
    .source-editor,
    .dist-editor,
    .dist-precompile-ast-editor {
      flex: 1;
      .head-scss,
      .head-css {
        font-size: 20px;
        line-height: 30px;
        height: 30px;
        padding:0 10px;
        background: #ccc;
      }
      .head-scss {
        display: flex;
        justify-content: space-between;
        .info-scss{
          font-size: 12px;
          font-weight: bold;
        }
      }
      .head-css {
        border-left: 1px solid #000;
      }
      .content {
        height: 100%;
      }
    }
    .vertical {
      background-repeat: repeat-y;
      cursor: col-resize;
      border: 6px solid gray;
      height: 100%;
    }
  }
}
</style>
