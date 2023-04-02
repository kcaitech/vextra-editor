<script setup lang="ts">
import { Context } from '@/context';
import { Page } from '@kcdesign/data/data/page';
import { Shape, ShapeType } from '@kcdesign/data/data/shape';
import { onBeforeMount, defineProps, onBeforeUpdate, onMounted, onUnmounted, ref, computed } from 'vue';
import comsMap from './comsmap';
import { ShapeFrame } from '@kcdesign/data/data/baseclasses';
import { Action } from '@/context/workspace';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
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
const workspace = computed(() => props.context.workspace);
const childs = new Array<Shape>();
const trans = { x: 0, y: 0 };
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

const viewBox2Str = () => {
    return "" + props.viewbox.x + " " + props.viewbox.y + " " + props.viewbox.width + " " + props.viewbox.height;
}
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
onBeforeMount(() => {
    updater();
})
onMounted(() => {
    props.data.watch(watcher);
})
onUnmounted(() => {
    props.data.unwatch(watcher);
})
onBeforeUpdate(() => {
    updater();
})

</script>

<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" :viewBox="viewBox2Str()"
        :width="props.width" :height="props.height" :style="{ transform: matrix }"
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
    position: absolute;
    transform-origin: top left;
    background-color: var(--center-content-bg-color);
}
</style>