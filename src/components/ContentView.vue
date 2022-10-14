<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@/data/page';
import { reactive, defineProps, onBeforeUpdate, onBeforeMount, ComponentInternalInstance, getCurrentInstance } from 'vue';
import PageView from './PageView.vue';
import SelectionView from './SelectionView.vue';

const props = defineProps<{ context: Context, page: Page }>();
const matrix = reactive(new Matrix());

const width = 800;
const height = 600;
const scale_delta = 1.05;
const scale_delta_ = 1 / scale_delta;

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
function offset2Root() {
    let el = proxy?.$el
    let x = el.offsetLeft
    let y = el.offsetTop
    el = el.offsetParent
    while (el) {
        x += el.offsetLeft
        y += el.offsetTop
        el = el.offsetParent
    }
    return {x, y}
}

function onMouseWheel(e: WheelEvent) {
    const xy = offset2Root();
    const offsetX = e.x - xy.x;
    const offsetY = e.y - xy.y;
    matrix.trans(-offsetX, -offsetY);
    matrix.scale(Math.sign(e.deltaY) <= 0 ? scale_delta : scale_delta_);
    matrix.trans(offsetX, offsetY);
}

const viewBox = { x: 0, y: 0, width: 0, height: 0 };
const updateViewBox = () => {
    viewBox.x = viewBox.y = viewBox.width = viewBox.height = 0;

    const cc = props.page.childsCount || 0;
    const frame = props.page.frame;
    let right = frame.width || 800;
    let bottom = frame.height || 600;
    let left = 0;
    let top = 0;

    for (let i = 0; i < cc; i++) {
        const child = props.page.getChildByIndex(i);
        const cf = child.frame;
        right = Math.max(right, cf.x + cf.width + 1);
        bottom = Math.max(bottom, cf.y + cf.height + 1);
        left = Math.min(left, cf.x);
        top = Math.min(top, cf.y);
    }

    const expandBox = 20;
    viewBox.x = left - expandBox;
    viewBox.y = top - expandBox;
    viewBox.width = right - viewBox.x + expandBox;
    viewBox.height = bottom - viewBox.y + expandBox;
}

onBeforeMount(() => {
    updateViewBox();
})

onBeforeUpdate(() => {
    updateViewBox();
    // console.log(viewBox);
});

</script>

<template>
    <div @wheel.passive="onMouseWheel">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toString()" :viewbox="viewBox"
            :width="width" :height="height"></PageView>
        <SelectionView :context="props.context" :matrix="matrix.toArray()" :viewbox="viewBox" :width="width"
            :height="height"></SelectionView>
    </div>
</template>

<style scoped>
div {
    background-color: var(--center-content-bg-color);
    position: relative;
}
</style>