<template>
    <div class="huffman">
        <h1>Demo of <a href="https://github.com/wizardpisces/huffman-ts" target="__blank">huffman-ts</a></h1>
        <ul>
            <li>Raw data: <input type="text" @input="onRawDataChange" v-model="huffmanData.rawString"></li>
            <li>Encoded bit string: "{{huffmanData.encodedBit}}"</li>
            <li>Encoded char string: "{{huffmanData.encodedCharString}}"</li>
            <li>Encoded huffman tree: "{{huffmanData.treeEncoded}}"</li>
        </ul>
    </div>

</template>
<script lang="ts">
import { defineComponent,reactive,ref } from 'vue'
import {Huffman} from 'huffman-ts'
export default defineComponent({

    setup() {

        let huffmanData = reactive({
            rawString:'abcaa',
            encodedBit: '',
            encodedCharString: '',
            treeEncoded:''
        })

        function onRawDataChange(){
            let txt = huffmanData.rawString
            let huffman = Huffman.treeFromText(txt)
            huffmanData.encodedBit = huffman.encodeBitString(txt);
            huffmanData.encodedCharString = huffman.encode(txt);
            huffmanData.treeEncoded = JSON.stringify(huffman.encodeTree());
        }

        onRawDataChange()

        return {
            huffmanData,
            onRawDataChange
        }
    },
})
</script>
<style lang="scss">
.huffman{
    padding-left:34px;
}
</style>
