import { on, isServer } from '../utils/dom';
import type { DirectiveBinding, ObjectDirective } from 'vue'

type DocumentHandler = <T extends Event>(mouseup: T, mousedown: T) => void;
type MetaData = {
    documentHandler: DocumentHandler
    bindingFn:Function
}

/**
 * Todos:
 * 1. need to resolve popup case
 * 2. consider el bind with multiple handlers
 */
let nodeMap:Map<Element,MetaData> = new Map()

let startClick: Event;

if(!isServer){
    on(document, 'mousedown', e => (startClick = e));
    
    on(document, 'mouseup', (mouseupEvent: Event) => {
        for (const handlers of nodeMap.values()) {
            handlers.documentHandler(mouseupEvent, startClick)
        }
    });
}
/**
 * 
 * create closure for later judgement
 */
function createDocumentHandler(el: Element, binding: DirectiveBinding): DocumentHandler {
    return function (mouseup, mousedown) {
        if (!mouseup.target ||
            !mousedown.target ||
            el.contains(mouseup.target as  Node) ||
            el.contains(mousedown.target as Node) ||
            el === mouseup.target) return;

        let metaData = nodeMap.get(el) as MetaData
        if (metaData.bindingFn){
            metaData.bindingFn(startClick);
        }
    };
}

const ClickOutside: ObjectDirective = {
    beforeMount(el: Element, binding, vnode) {
        nodeMap.set(el, {
            documentHandler: createDocumentHandler(el, binding),
            bindingFn: binding.value
        })
    },
    updated(el: Element, binding) {
        nodeMap.set(el,{
            documentHandler: createDocumentHandler(el, binding),
            bindingFn: binding.value
        })
    },
    unmounted(el: Element) {
        nodeMap.delete(el)
    }
};

export default ClickOutside