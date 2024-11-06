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
import { PageView } from "@kcdesign/data";
import ShowHiddenLeft from "./ShowHiddenLeft.vue";
import { Navi } from "@/context/navigate";
const props = defineProps<{ context: Context, page: PageView, leftTriggleVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const structure = ref<{ pagelistHeight: number, pagelistHeightBackup: number }>({ pagelistHeight: 120, pagelistHeightBackup: 32 });
const container = ref<HTMLDivElement>();
const sash = ref<HTMLDivElement>();
const containerHeight = ref<number>(0);
const isPagelistFold = ref<boolean>(props.context.user.pageListSpace.fold);

function dragStart() {
    structure.value.pagelistHeightBackup = structure.value.pagelistHeight
}
function onDragOffset(offset: number) {
    structure.value.pagelistHeight = Math.min(containerHeight.value - 90, Math.max(74, structure.value.pagelistHeightBackup + Number(offset)))
}
function pageListFold(fold: boolean) {
    isPagelistFold.value = fold;
    props.context.user.modifyPageListSpaceFold(fold);
}
function end() {
    props.context.user.modifyPageListSpaceHeight(structure.value.pagelistHeight);
}

const observer = new ResizeObserver(() => {
    const el = container.value;
    el && (containerHeight.value = el.clientHeight);
})
const showHiddenLeft = () => {
    emit('showNavigation')
}
function init_pagelist_height() {
    isPagelistFold.value = props.context.user.pageListSpace.fold;
    structure.value.pagelistHeight = props.context.user.pageListSpace.height;
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
<div class="shape-tab-container" ref="container">
    <div class="navi" :style="{ height: isPagelistFold ? '40px' : `${structure.pagelistHeight}px` }">
            <PageList :context="props.context" v-bind="$attrs" @fold="pageListFold" :page="page"/>
            <Sash v-if="!isPagelistFold" ref="sash" side="bottom" @dragStart="dragStart" @offset="onDragOffset"
                  @drag-end="end"/>
        </div>
    <div class="navi"
            :style="{ height: isPagelistFold ? 'calc(100% - 40px)' : `calc(100% - ${structure.pagelistHeight}px)` }">
            <ShapeList :context="props.context" :page="page" :pageHeight="structure.pagelistHeight"/>
        </div>
        <!-- <ShowHiddenLeft :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft" /> -->
    </div>
</template>

<style scoped lang="scss">
.shape-tab-container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    > .navi {
        position: relative;
    }
}
</style>