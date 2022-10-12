<script setup lang="ts">
import { objectId } from '@/basic/objectid';
import { Context } from '@/context';
import { Page } from '@/data/page';
import { Shape } from '@/data/shape';
import { onBeforeMount, defineProps, getCurrentInstance, ComponentInternalInstance, onBeforeUpdate } from 'vue';
import comsMap from './comsmap';

const props = defineProps<{ context: Context, data: Page, matrix: string }>();
const childs = new Array<{ data: Shape, id: number }>();
const viewBox = { x: 0, y: 0, w: 0, h: 0 };

const updater = () => {
    childs.length = 0;
    viewBox.x = viewBox.y = viewBox.w = viewBox.h = 0;

    const cc = props.data.childsCount || 0;
    const frame = props.data.frame;
    let right = frame.width || 800;
    let bottom = frame.height || 600;
    let left = 0;
    let top = 0;

    for (let i = 0; i < cc; i++) {
        const child = props.data.getChildByIndex(i);
        const cf = child.frame;
        right = Math.max(right, cf.x + cf.width + 1);
        bottom = Math.max(bottom, cf.y + cf.height + 1);
        left = Math.min(left, cf.x);
        top = Math.min(top, cf.y);
        childs.push({ data: child, id: objectId(child) });
    }

    const expandBox = 20;
    viewBox.x = left - expandBox;
    viewBox.y = top - expandBox;
    viewBox.w = right - viewBox.x + expandBox;
    viewBox.h = bottom - viewBox.y + expandBox;
}

onBeforeMount(() => {
    updater();
})

// onMounted(() => {
//     props.data.watch(updater);
// })

// onUnmounted(() => {
//     props.data.unwatch(updater);
// })

const viewBox2Str = () => {
    return "" + viewBox.x + " " + viewBox.y + " " + viewBox.w + " " + viewBox.h;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

function onClick(e: MouseEvent) {
    console.log(e);
    console.log(proxy?.$el);
    // console.log(getCurrentInstance());
}

onBeforeUpdate(() => {
    // console.log("page",props.data.id)
    updater();
})

</script>

<template>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:xhtml="http://www.w3.org/1999/xhtml" :viewBox="viewBox2Str()" :width="800" :height="600"
            @click="onClick" :style="{ transform: matrix }">

            <defs>
                <filter id="artboard-shadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feColorMatrix result="colOut" in="SourceAlpha" type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" /> // rgba, 30% alpha
                    <feGaussianBlur result="blurOut" in="colOut" stdDeviation="3" />
                    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
                </filter>
            </defs>

            <component v-for="c in childs" :key="c.id" :is="comsMap.get(c.data.type)" :data="c.data"
                :boolop="props.data.boolOp">
            </component>

        </svg>
</template>

<style scoped>

svg {
    transform-origin: top left;
    background-color: var(--center-content-bg-color);
}
</style>