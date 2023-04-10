<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-09 11:15:13
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 14:34:55
 * @FilePath: \kcdesign\src\components\Document\Navigation\ShapeTab.vue
-->
<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
import Sash from "@/components/common/Sash.vue";
import { Page } from "@kcdesign/data/data/page";
const props = defineProps<{ context: Context, page: Page }>();

const structure = ref<{pagelistHeight: number, pagelistHeightBackup: number}>({pagelistHeight: 30, pagelistHeightBackup: 30});
const container = ref<HTMLDivElement>();
const sash = ref<HTMLDivElement>();
const containerHeight = ref<number>(0);
const isPagelistFold = ref<boolean>(false);

function dragStart() {
    structure.value.pagelistHeightBackup = structure.value.pagelistHeight
}
function onDragOffset(offset: number) {
    const newheight = Math.min(70, Math.max(30, structure.value.pagelistHeightBackup + Number((offset * 100 / containerHeight.value).toFixed(4))));
    structure.value.pagelistHeight = newheight
}
function pageListFold(fold: boolean) {
    isPagelistFold.value = fold;
}

const observer = new ResizeObserver(() => {
    const el = container.value;
    el && (containerHeight.value = el.clientHeight);
})

onMounted(() => {
    container.value && observer.observe(container.value);
});
onUnmounted(() => {
    observer.disconnect();
})

</script>

<template>
    <div class="shapetab-container" ref="container">
        <div class="page-navi" :style="{height: isPagelistFold ? '30px' : `${structure.pagelistHeight}%`}">
            <PageList :context="props.context" v-bind="$attrs" @fold="pageListFold" :page="page"></PageList>
            <Sash v-if="!isPagelistFold" ref="sash" side="bottom" @dragStart="dragStart" @offset="onDragOffset"></Sash>
        </div>
        <div :style="{height: isPagelistFold ? 'calc(100% - 30px)' : `${100 - structure.pagelistHeight}%`}">
            <ShapeList :context="props.context" :page="page"></ShapeList>
        </div>
    </div>
    
</template>

<style scoped lang="scss">
.shapetab-container {
    width: 100%;
    height: 100%;
    > .page-navi {
        position: relative;
    }
}
</style>