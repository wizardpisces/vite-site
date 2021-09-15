import {
    ref,
    onMounted
} from 'vue';

import {
    compile,
    parse
} from 'tiny-sass-compiler'

const CodeMirrorOptions = {
    value: '',
    mode: "sass",
    indentUnit: 4,
    theme: 'mdn-like',
    height: '100px',
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
let rawCode = `$margin: 10px;
.main2{
    margin: $margin;
}
.main {
    .child1{
        .child2{
            color:green;
        }
        .child3{
            color:red;
        }
    }
}
$property2 : skew(30deg, 20deg);
@mixin transform($property,$property2) {
  -webkit-transform: $property;
  -ms-transform: $property;
  transform: $property $property2;
}
.box { 
  @include transform(rotate(30deg),$property2); 
}
`

export default () => {
    const sassRef = ref(null);
    const cssRef = ref(null);
    const precompileAstRef = ref(null);
    let sourceCode = rawCode,
        distCode = compile(sourceCode).code,
        distPreCompileAst = parse(sourceCode, {
            source: sourceCode,
            filename: 'default.scss'
        }),
        sourceCodeMirror,
        distCodeMirror,
        distPrecompileAstCodeMirror;

    function createErrorInfo(e) {
        let line = e.loc.start.line,
            column = e.loc.start.column,
            len = e.loc.end.offset - e.loc.start.offset,
            source = sourceCode.split('\n')[line - 1];

        return `${e.message.split('\n')[0]}
╷
│${source}
│${' '.repeat(column-1)}${'^'.repeat(len)}
╵
stdin ${line}:${column} root stylesheet on line ${line} at column ${column}
        `;
    }

    const change = () => {
        let distCode = '';
        try {
            distCode = compile(sourceCode).code
            distPreCompileAst = parse(sourceCode, {
                source: sourceCode,
                filename: 'default.scss'
            })
        } catch (e) {
            console.log(e)
            distCode = createErrorInfo(e)
        }
        distCodeMirror.setOption('value', distCode)

        distPrecompileAstCodeMirror.setOption('value', distCode)
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
            sourceCodeMirror.setSize(null, '100%')
        }
        if (!distCodeMirror) {
            distCodeMirror = CodeMirror(cssRef.value, {
                ...CodeMirrorOptions,
                mode: 'css',
                value: distCode
            });
            distCodeMirror.setSize(null, '100%')
        }
        if (!distPrecompileAstCodeMirror) {
            // console.log('distPreCompileAst', distPreCompileAst,'error')
            distPrecompileAstCodeMirror = CodeMirror(precompileAstRef.value, {
                ...CodeMirrorOptions,
                mode: {
                    name:'javascript',
                    json:true
                },
                value: JSON.stringify(distPreCompileAst)
            });
            distPrecompileAstCodeMirror.setSize(null, '100%')
        }
    }

    onMounted(() => {
        console.log('use code mounted!')
        paint()
    })

    return {
        sassRef,
        cssRef,
        precompileAstRef
    }
}