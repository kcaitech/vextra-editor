<script setup lang="ts">
import { Matrix } from '@/basic/matrix';
import { Context } from '@/context';
import { Page } from '@/data/page';
import { ref } from '@vue/reactivity';
import { reactive, defineProps, onMounted, onUnmounted, watchEffect } from 'vue';
import PageView from './Content/PageView.vue';
import SelectionView from './SelectionView.vue';
import { init as renderinit } from '@/render'

const props = defineProps<{ context: Context, page: Page }>();
const matrix = reactive(new Matrix());

const matrixMap = new Map<string, Matrix>();
let savePageId: string = "";
watchEffect(() => {
    const id = props.page.id;
    if (savePageId.length > 0 && id != savePageId) {
        let m = matrixMap.get(savePageId);
        if (m) m.reset(matrix.toArray());
    }
    savePageId = id;
    let m = matrixMap.get(id);
    if (!m) {
        m = new Matrix();
        matrixMap.set(id, m);
    }
    matrix.reset(m);
})

const inited = ref(false);
renderinit().then(() => {
    inited.value = true;
})

const width = 800;
const height = 600;
const scale_delta = 1.05;
const scale_delta_ = 1 / scale_delta;

// const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const root = ref<HTMLDivElement>();
function offset2Root() {
    let el = root.value as HTMLElement;
    let x = el.offsetLeft
    let y = el.offsetTop
    el = el.offsetParent as HTMLElement;
    while (el) {
        x += el.offsetLeft
        y += el.offsetTop
        el = el.offsetParent as HTMLElement;
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
    <div @wheel.passive="onMouseWheel" :reflush="reflush" ref="root" v-if="inited">
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