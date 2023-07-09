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
const props = defineProps<{ context: Context, page: Page, leftTriggleVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()

const structure = ref<{ pagelistHeight: number, pagelistHeightBackup: number }>({ pagelistHeight: 162, pagelistHeightBackup: 36 });
const container = ref<HTMLDivElement>();
const sash = ref<HTMLDivElement>();
const containerHeight = ref<number>(0);
const isPagelistFold = ref<boolean>(false);

function dragStart() {
    structure.value.pagelistHeightBackup = structure.value.pagelistHeight
}
function onDragOffset(offset: number) {
    const newheight = Math.min(containerHeight.value - 100, Math.max(70, structure.value.pagelistHeightBackup + Number(offset)));
    structure.value.pagelistHeight = newheight
}
function pageListFold(fold: boolean) {
    isPagelistFold.value = fold;
}

const observer = new ResizeObserver(() => {
    const el = container.value;
    el && (containerHeight.value = el.clientHeight);
})
const showHiddenLeft = () => {
    emit('showNavigation')
}

onMounted(() => {
    container.value && observer.observe(container.value);
});
onUnmounted(() => {
    observer.disconnect();
})

</script>

<template>
    <div class="shapetab-container" ref="container">
        <div class="page-navi" :style="{ height: isPagelistFold ? '30px' : `${structure.pagelistHeight}px` }">
            <PageList :context="props.context" v-bind="$attrs" @fold="pageListFold" :page="page"></PageList>
            <Sash v-if="!isPagelistFold" ref="sash" side="bottom" @dragStart="dragStart" @offset="onDragOffset"></Sash>
        </div>
        <div class="page-navi"
            :style="{ height: isPagelistFold ? 'calc(100% - 30px)' : `calc(100% - ${structure.pagelistHeight}px)` }">
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

    >.page-navi {
        position: relative;
        transition: all 0.5s ease 0s;
    }
}
</style>