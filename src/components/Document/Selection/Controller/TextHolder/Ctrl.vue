<script lang="ts" setup>
import {Matrix, TextShape} from "@kcdesign/data";
import {Context} from "@/context";
import TextInput from "@/components/Document/Selection/Controller/Text/TextInput.vue";
import SelectView from "@/components/Document/Selection/Controller/Text/SelectView.vue";
import {reactive} from "vue";

interface Props {
    matrix: Matrix
    context: Context
    shape: TextShape
    root: { x: number, y: number }
    viewBox: string
}

const props = defineProps<Props>();
const matrix = reactive(new Matrix());
let downIndex: { index: number, before: boolean };

function down(e: MouseEvent) {
    if (e.button === 0) {
        e.stopPropagation();
        props.context.menu.menuMount();
        const selection = props.context.textSelection;
        matrix.reset(props.matrix);
        const xy = matrix.inverseCoord(e.clientX - props.root.x, e.clientY - props.root.y);
        downIndex = selection.locateText(xy.x, xy.y);
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
    }
}

function move(e: MouseEvent) {
    e.stopPropagation();
    const selection = props.context.textSelection;
    const {clientX, clientY} = e;
    const root = props.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        if (locate.placeholder) selection.setCursor(locate.index + 1, false, props.shape.text);
        else selection.setCursor(locate.index, locate.before, props.shape.text);
    } else {
        selection.selectText(downIndex.index, locate.index, props.shape.text);
    }
}

function up(e: MouseEvent) {
    e.stopPropagation();
    const selection = props.context.textSelection;
    const {clientX, clientY} = e;
    const root = props.root;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = selection.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        if (locate.placeholder) selection.setCursor(locate.index + 1, false, props.shape.text);
        else selection.setCursor(locate.index, locate.before, props.shape.text);
    } else {
        selection.selectText(downIndex.index, locate.index, props.shape.text);
    }
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
}

</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
         :viewBox="viewBox" overflow="visible"
         :style="{ transform: matrix.toString() }"
         @mousedown="down"
    >
        <SelectView :context="props.context" :shape="(props.shape as TextShape)"
                    :matrix="matrix.toArray()"></SelectView>
    </svg>
    <TextInput :context="props.context" :shape="(props.shape as TextShape)" :matrix="matrix.toArray()"></TextInput>
</template>
<style scoped lang="scss">
svg {
    width: calc(100% - 8px);
    position: absolute;
}
</style>
