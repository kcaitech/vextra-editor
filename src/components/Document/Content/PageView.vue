<script setup lang="ts">
import { Matrix } from '@kcdesign/data/basic/matrix';
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { ShapeType } from '@kcdesign/data/data/typesdefine';
import { defineProps, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import comsMap from './comsmap';
import { v4 as uuid } from "uuid";
import shapeTitle from './shapeTitle.vue';

const props = defineProps<{
    context: Context,
    data: Page,
    matrix: number[],
}>();
const matrixWithFrame = new Matrix()
const reflush = ref(0);
const rootId = ref<string>('pageview');
const watcher = () => {
    reflush.value++;
}
function pageViewRegister(mount: boolean) {
    if (mount) {
        const id = (uuid().split('-').at(-1)) || 'pageview';
        rootId.value = id;
    } else {
        rootId.value = 'pageview';
    }
    props.context.workspace.setPageViewId(rootId.value);
}
watchEffect(() => {
    matrixWithFrame.reset(props.matrix)
    matrixWithFrame.preTrans(props.data.frame.x, props.data.frame.y)

})
const stopWatchPage = watch(() => props.data, (value, old) => {
    old.unwatch(watcher);
    value.watch(watcher);
    pageViewRegister(true);
})
onMounted(() => {
    props.data.watch(watcher);
    pageViewRegister(true);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
    stopWatchPage();
    pageViewRegister(false);
})
</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
        :viewBox='"0 0 " + data.frame.width + " " + data.frame.height' :width="data.frame.width" :height="data.frame.height"
        :style="{ transform: matrixWithFrame.toString() }" overflow="visible" :reflush="reflush !== 0 ? reflush : undefined"
        :data-area="rootId">
        <component v-for="c in data.childs" :key="c.id" :is="comsMap.get(c.type) ?? comsMap.get(ShapeType.Rectangle)"
            :data="c" />
    </svg>
    <!-- <shapeTitle :matrix="props.matrix" :context="props.context" :data="props.data"></shapeTitle> -->
</template>

<style scoped>
svg {
    position: absolute;
    transform-origin: top left;
    background-color: var(--center-content-bg-color);
}
</style>