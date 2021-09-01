<template>
    <div class="huffman">
        <h1>huffman demo</h1>
        <ul>
            <li>raw data: <input type="text" @input="onRawDataChange" v-model="huffmanData.rawString"></li>
            <li>encoded bit string: "{{huffmanData.encodedBit}}"</li>
            <li>encoded char string: "{{huffmanData.encodedCharString}}"</li>
            <li>encoded huffman tree: "{{huffmanData.treeEncoded}}"</li>
        </ul>
    </div>

</template>
<script lang="ts">
import { defineComponent,ref } from 'vue'
import {Huffman} from 'huffman-ts'
export default defineComponent({

    setup() {

        let huffmanData = ref({
            rawString:'abcaa',
            encodedBit: '',
            encodedCharString: '',
            treeEncoded:''
        })

        function onRawDataChange(){
            let txt = huffmanData.value.rawString
            let huffman = Huffman.treeFromText(txt)
            huffmanData.value.encodedBit = huffman.encodeBitString(txt);
            huffmanData.value.encodedCharString = huffman.encode(txt);
            huffmanData.value.treeEncoded = JSON.stringify(huffman.encodeTree());
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
