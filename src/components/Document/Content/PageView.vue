<script setup lang="ts">
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { Shape } from '@kcdesign/data/data/shape';
import { onBeforeMount, defineProps, onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue';
import comsMap from './comsmap';

const props = defineProps<{
    context: Context,
    data: Page,
    matrix: string,
    viewbox: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    width: number,
    height: number
}>();
const childs = new Array<Shape>();
const trans = {x: 0, y: 0};
const updater = () => {
    const cc = props.data.childs.length || 0;
    if (childs.length !== cc) childs.length = cc;
    for (let i = 0; i < cc; i++) {
        const child = props.data.childs[i];
        if (!childs[i] || childs[i].id != child.id) {
            childs[i] = child;
        }
    }
    trans.x = props.data.frame.x;
    trans.y = props.data.frame.y;
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
    return "" + props.viewbox.x + " " + props.viewbox.y + " " + props.viewbox.width + " " + props.viewbox.height;
}

// const { proxy } = getCurrentInstance() as ComponentInternalInstance;

function onClick(e: MouseEvent) {
    // console.log(e);
    // console.log(proxy?.$el);
    // console.log(getCurrentInstance());
}

onBeforeUpdate(() => {
    // console.log("page",props.data.id)
    updater();
})

const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
})

</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" :viewBox="viewBox2Str()" :width="props.width" :height="props.height" @click="onClick"
        preserveAspectRatio="xMinYMin meet"
        :style="{ transform: matrix }"
        :reflush="reflush !== 0 ? reflush : undefined">

        <defs>
            <filter id="artboard-shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feColorMatrix result="colOut" in="SourceAlpha" type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" /> // rgba, 30% alpha
                <feGaussianBlur result="blurOut" in="colOut" stdDeviation="3" />
                <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
            </filter>
        </defs>

        <g :transform="'translate(' + trans.x + ',' + trans.y + ')'">
            <component v-for="c in childs" :key="c.id" :is="comsMap.get(c.type)" :data="c" />
        </g>

    </svg>
</template>

<style scoped>
svg {
    transform-origin: top left;
    background-color: var(--center-content-bg-color);
}
</style>