<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@/data/page';
import { computed, ref } from '@vue/reactivity';
import { reactive, defineProps, onBeforeUpdate, onBeforeMount, ComponentInternalInstance, getCurrentInstance, onMounted, onUnmounted } from 'vue';
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

const viewBox = () => {
    const frame = props.page.frame;
    const expandBox = 20;
    const x = frame.x - expandBox;
    const y = frame.y - expandBox;
    const width = frame.width + 2*expandBox;
    const height = frame.height + 2*expandBox;
    return { x, y, width: Math.max(800, width), height: Math.max(600, height) };
}
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
onMounted(() => {
    props.page.watch(watcher);
})
onUnmounted(() => {
    props.page.unwatch(watcher);
})

</script>

<template>
    <div @wheel.passive="onMouseWheel" :reflush="reflush">
        <PageView :context="props.context" :data="(props.page as Page)" :matrix="matrix.toString()" :viewbox="viewBox()"
            :width="width" :height="height"></PageView>
        <SelectionView :context="props.context" :matrix="matrix.toArray()" :viewbox="viewBox()" :width="width"
            :height="height"></SelectionView>
    </div>
</template>

<style scoped>
div {
    background-color: var(--center-content-bg-color);
    position: relative;
}
</style>