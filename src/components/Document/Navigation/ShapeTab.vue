<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-09 11:15:13
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 14:34:55
 * @FilePath: \kcdesign\src\components\Document\Navigation\ShapeTab.vue
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
import Sash from "@/components/common/Sash.vue";
import { Page } from "@kcdesign/data";
import ShowHiddenLeft from "./ShowHiddenLeft.vue";
import { Navi } from "@/context/navigate";
const props = defineProps<{ context: Context, page: Page, leftTriggleVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const i_height = 162;
const structure = ref<{ pagelistHeight: number, pagelistHeightBackup: number }>({ pagelistHeight: i_height, pagelistHeightBackup: 36 });
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
    const newheight = Math.min(containerHeight.value - 100, Math.max(76, structure.value.pagelistHeightBackup + Number(offset)));
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
const showHiddenLeft = () => {
    emit('showNavigation')
}
function init_pagelist_height() {
    const page_list = props.context.data.pagesList.length;
    let w_height = document.body.clientHeight;
    if (container.value) {
        w_height = container.value.clientHeight;
    }
    let max_height = Math.max(w_height * 0.5 - 36, i_height);
    let init_height = page_list * 36 + 64;
    init_height = Math.max(init_height, i_height);
    structure.value.pagelistHeight = Math.min(init_height, max_height);
}
function navi_watcher(t?: number) {
    if (t === Navi.ADD_PAGE) {
        init_pagelist_height();
    }
}
onMounted(() => {
    container.value && observer.observe(container.value);
    init_pagelist_height();
    props.context.navi.watch(navi_watcher);
});
onUnmounted(() => {
    observer.disconnect();
    props.context.navi.unwatch(navi_watcher);
})
</script>

<template>
    <div class="shapetab-container" ref="container">
        <div class="page-navi" :style="{ height: isPagelistFold ? '40px' : `${structure.pagelistHeight}px`, transition }">
            <PageList :context="props.context" v-bind="$attrs" @fold="pageListFold" :page="page"></PageList>
            <Sash v-if="!isPagelistFold" ref="sash" side="bottom" @dragStart="dragStart" @offset="onDragOffset"
                @drag-end="end"></Sash>
        </div>
        <div class="page-navi"
            :style="{ height: isPagelistFold ? 'calc(100% - 40px)' : `calc(100% - ${structure.pagelistHeight}px)` }">
            <ShapeList :context="props.context" :page="page" :pageHeight="structure.pagelistHeight"></ShapeList>
        </div>
        <ShowHiddenLeft :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft">
        </ShowHiddenLeft>
    </div>
</template>

<style scoped lang="scss">
.shapetab-container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    >.page-navi {
        position: relative;
        transition: all 0.3s ease 0s;
    }
}
</style>