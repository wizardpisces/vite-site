import {
    ref,
    onMounted
} from 'vue';

import {
    compile
} from 'tiny-sass-compiler/dist/tiny-sass-compiler.esm-browser.prod.js'

const CodeMirrorOptions = {
    value: '',
    mode: "sass",
    indentUnit: 4,
    theme: 'mdn-like',
    height:'100px',
    lineNumbers: true,
    smartIndent: true,
    tabSize: 2,
    indentWithTabs: false,
    lineWrapping: true,
    autofocus: true,
    gutters: ["CodeMirror-lint-markers"],
    lint: {
        options: {
            rules: {
                "no-empty-rulesets": 1,
            }
        }
    }
}
let rawCode = `$font-stack:    Helvetica, sans-serif;
$primary-color: #333;

body .test{
  font: 100% $font-stack;
  color: $primary-color;
}
`

export default () => {
    const sassRef = ref(null);
    const cssRef = ref(null);
    let sourceCode = rawCode,
        distCode = compile(sourceCode).code,
        sourceCodeMirror,
        distCodeMirror;

    const change = () => {
        let distCode = '';
        try{
            distCode = compile(sourceCode).code
        }catch(e){
            distCode = e.message;
        }
        distCodeMirror.setOption('value', distCode)
    }

    const paint = () => {
        if (!sourceCodeMirror) {
            sourceCodeMirror = CodeMirror(sassRef.value, {
                ...CodeMirrorOptions,
                mode: "sass",
                value: rawCode
            });
            sourceCodeMirror.on('change', (cm) => {
                sourceCode = cm.getValue()
                window.requestAnimationFrame(change)
            })
            sourceCodeMirror.setSize(null,'100%')
        }
        if (!distCodeMirror) {
            distCodeMirror = CodeMirror(cssRef.value, {
                ...CodeMirrorOptions,
                mode:'css',
                value: distCode
            });
            distCodeMirror.setSize(null, '100%')
        }
    }

    onMounted(() => {
        console.log('use code mounted!')
        paint()
    })

    return {
        change,
        sassRef,
        cssRef
    }
}