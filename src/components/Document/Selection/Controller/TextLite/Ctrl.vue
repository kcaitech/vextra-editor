<script lang="ts" setup>
import {Matrix, TextShape} from "@kcdesign/data";
import {Context} from "@/context";
import TextInput from "@/components/Document/Selection/Controller/Text/TextInput.vue";
import SelectView from "@/components/Document/Selection/Controller/Text/SelectView.vue";
import {reactive, watch} from "vue";
import {TextSelectionLite} from "@/context/textselectionlite";
import {Selection} from "@/context/selection";

interface Props {
    matrix: number[]
    context: Context
    shape: TextShape
    root: { x: number, y: number }
    viewBox: string
}

const props = defineProps<Props>();
const matrix = reactive(new Matrix());
let downIndex: { index: number, before: boolean };
const text_selection_lite: TextSelectionLite = props.context.selection.getTextSelection(props.shape);
watch(() => props.matrix, () => {
    matrix.reset(props.matrix);
}, {immediate: true});
const root = {x: 0, y: 0};

function update_root(e: MouseEvent) {
    const element = (e.target as Element).closest('.holder-container');
    if (!element) return;
    const box = element.getBoundingClientRect();
    root.x = box.x + 4;
    root.y = box.y + 2;
}

function down(e: MouseEvent) {
    if (e.button !== 0) return;
    e.stopPropagation();
    update_root(e);
    props.context.menu.menuMount();
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(e.clientX - root.x, e.clientY - root.y);
    downIndex = text_selection_lite.locateText(xy.x, xy.y);
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) return;
    e.stopPropagation();
    const {clientX, clientY} = e;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = text_selection_lite.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        if (locate.placeholder) {
            text_selection_lite.setCursor(locate.index + 1, false);
        } else {
            text_selection_lite.setCursor(locate.index, locate.before);
        }
    } else {
        text_selection_lite.selectText(downIndex.index, locate.index);
    }
}

function up(e: MouseEvent) {
    e.stopPropagation();
    const {clientX, clientY} = e;
    matrix.reset(props.matrix);
    const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
    const locate = text_selection_lite.locateText(xy.x, xy.y);
    if (downIndex.index === locate.index) {
        if (locate.placeholder) {
            text_selection_lite.setCursor(locate.index + 1, false);
        } else {
            text_selection_lite.setCursor(locate.index, locate.before);
        }
    } else {
        text_selection_lite.selectText(downIndex.index, locate.index);
    }
}
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
         :viewBox="viewBox" overflow="visible"
         :style="{ transform: matrix.toString() }"
         @mousedown="down" @mousemove="move" @mouseup="up"
    >
        <SelectView :context="props.context" :shape="(props.shape as TextShape)"
                    :matrix="new Matrix().toArray()" :main-notify="Selection.CHANGE_TEXT_LITE"
                    :selection="text_selection_lite"></SelectView>
    </svg>
    <TextInput :context="props.context" :shape="(props.shape as TextShape)" :matrix="new Matrix().toArray()"
               :main-notify="Selection.CHANGE_TEXT_LITE" :selection="text_selection_lite"></TextInput>
</template>
<style scoped lang="scss">
svg {
    width: calc(100% - 8px);
    position: absolute;
}
</style>
