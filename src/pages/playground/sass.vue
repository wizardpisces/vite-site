<template>
  <div class="sass-playground">
    <div class="pannel">
      <klk-button @click="toggleAst" size='small'>toggle ast</klk-button>
    </div>
    <div class="editor">
      <div class='source-editor'>
        <div class="head">scss</div>
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
        <div class="head">css</div>
        <div
          class="content"
          ref="cssRef"
        >

        </div>
      </div>
      <div :class="astEditorCls">
        <div class="head">scss related ast</div>
        <div
          class="content"
          ref="precompileAstRef"
        >

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import Code from './composition/use-code.js'
export default {
  name: 'SassPlayground',
  components: {
    // CustomButton,
  },
  setup(props,ctx) {
    const astEditorCls = ref('hidden')
    const {
      sassRef,
      cssRef,
      precompileAstRef,
      changeCompiler
    } = Code()

    onMounted(() => {
      console.log('sass playground mounted!')
    })

    function toggleAst(){
      if(astEditorCls.value === 'hidden'){
        astEditorCls.value  = 'dist-precompile-ast-editor'
      }else{
        astEditorCls.value = 'hidden'
      }
    }

    return {
      sassRef,
      cssRef,
      precompileAstRef,
      changeCompiler,
      toggleAst,
      astEditorCls
    }
  }
}
</script>
<style lang="scss">
.sass-playground {
  width: 100%;
  height: 500px;
  position: relative;
  display: flex;
  flex-direction: column;
  .hidden{
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
      .head {
        background: silver;
        font-size: 20px;
        padding-left: 10px;
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
