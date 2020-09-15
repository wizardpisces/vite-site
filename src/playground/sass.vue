<template>
  <div class="sass-playground">
    <div class="pannel">
      <!-- <custom-button v-on:click.stop.prevent="change">Run</custom-button> -->
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
      <span
        role="presentation"
        class="Resizer vertical "
      ></span>
      <div class="dist-editor">
        <div class="head">css</div>
        <div
          class="content"
          ref="cssRef"
        >

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import Code from '../composition/use-code.js'
// import CustomButton from './button.vue'
export default {
  name: 'SassPlayground',
  components: {
    // CustomButton,
  },
  setup(props) {

    const {
      sassRef,
      cssRef,
      change
    } = Code()

    onMounted(() => {
      console.log('sass playground mounted!')
    })

    return {
      sassRef,
      cssRef,
      change
    }
  }
}
</script>
<style lang="scss">
.sass-playground {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  .pannel {
    display: flex;
    width: 100%;
    height: 50px;
    background: sienna;
  }
  .editor {
    flex: 1;
    display: flex;
    height: 100%;
    flex-direction: row;
    .source-editor,
    .dist-editor {
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
