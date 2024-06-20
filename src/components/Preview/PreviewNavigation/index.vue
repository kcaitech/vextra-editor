<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { Context } from "@/context";
import PageList from "./PreviewPageList.vue";
import Sash from "@/components/common/Sash.vue";
import { PageView } from "@kcdesign/data";
import ShapeList from "./PreviewShapeList.vue";
import { Navi } from "@/context/navigate";
const props = defineProps<{ context: Context, page: PageView, leftTriggleVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const i_height = 119;
const structure = ref<{ pagelistHeight: number, pagelistHeightBackup: number }>({ pagelistHeight: i_height, pagelistHeightBackup: 32 });
const container = ref<HTMLDivElement>();
const sash = ref<HTMLDivElement>();
const containerHeight = ref<number>(0);
const isPagelistFold = ref<boolean>(false);
const transition = ref<string>('0.3s');

function dragStart() {
    structure.value.pagelistHeightBackup = structure.value.pagelistHeight
    transition.value = '0s'
}
function onDragOffset(offset: number) {
    const newheight = Math.min(containerHeight.value - 110, Math.max(74, structure.value.pagelistHeightBackup + Number(offset)));
    structure.value.pagelistHeight = newheight
}
function pageListFold(fold: boolean) {
    isPagelistFold.value = fold;
}
function end() {
    transition.value = '0.3s'
}

const observer = new ResizeObserver(() => {
    const el = container.value;
    el && (containerHeight.value = el.clientHeight);
})

function init_pagelist_height() {
    const page_list = props.context.data.pagesList.length;
    let w_height = document.body.clientHeight;
    if (container.value) {
        w_height = container.value.clientHeight;
    }
    let max_height = 5 * 32 + 40;
    let init_height = page_list * 32 + 56;
    init_height = Math.max(init_height, i_height);
    structure.value.pagelistHeight = Math.min(init_height, max_height);
}
function navi_watcher(t?: number) {
    if (t === Navi.ADD_PAGE) {
        init_pagelist_height();
    }
}
const showHiddenLeft = () => {
    emit('showNavigation')
}

onMounted(() => {
    props.context.data.watch(init_pagelist_height);
    container.value && observer.observe(container.value);
    init_pagelist_height();
    props.context.navi.watch(navi_watcher);
});
onUnmounted(() => {
    props.context.data.unwatch(init_pagelist_height);
    observer.disconnect();
    props.context.navi.unwatch(navi_watcher);
})
</script>

<template>
    <div class="shapetab-container" ref="container">
        <div class="page-navi" :style="{ height: isPagelistFold ? '40px' : `${structure.pagelistHeight}px` }">
            <PageList :context="props.context" v-bind="$attrs" @fold="pageListFold" :page="page"></PageList>
            <Sash v-if="!isPagelistFold" ref="sash" side="bottom" @dragStart="dragStart" @offset="onDragOffset"
                @drag-end="end"></Sash>
        </div>
        <div class="page-navi"
            :style="{ height: isPagelistFold ? 'calc(100% - 40px)' : `calc(100% - ${structure.pagelistHeight}px)` }">
            <ShapeList :context="props.context" :page="page" :pageHeight="structure.pagelistHeight"></ShapeList>
        </div>
        <div class="showHiddenL" @click="showHiddenLeft" v-if="!showLeft || leftTriggleVisible"
            :style="{ opacity: showLeft ? 1 : 0.6 }">
            <svg-icon v-if="showLeft" class="svg" icon-class="left"></svg-icon>
            <svg-icon v-else class="svg" icon-class="right"></svg-icon>
        </div>
    </div>
</template>

<style scoped lang="scss">
.shapetab-container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    width: 100%;
    position: relative;
    border-right: 1px solid #EBEBEB;
    flex: 1 1 auto;
    box-shadow: inset 0px -1px 0px 0px #F0F0F0;

    >.page-navi {
        position: relative;
        // transition: all 0.3s ease 0s;
    }
    .showHiddenL {
        position: absolute;
        right: -16px;
        top: 40px;
        transform: translateY(-50%);
        z-index: 9;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0px 8px 8px 0px;
        background: #FFFFFF;
        width: 16px;
        height: 44px;
        box-sizing: border-box;
        border: 1px solid #F0F0F0;
        padding: 14px 0;

        >.svg {
            width: 16px;
            height: 16px;
        }
    }
}
</style>