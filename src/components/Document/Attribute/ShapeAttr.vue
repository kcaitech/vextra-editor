<script setup lang="ts">
import { defineProps, onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import { Shape } from '@/data/shape';
import IconText from '@/components/common/IconText.vue';
import { Context } from '@/context';
import { computed } from '@vue/reactivity';
const props = defineProps<{ context: Context, shape: Shape }>();
const editor = computed(() => {
    if (props.context.selection.selectedPage == undefined) {
        throw new Error("No Selected Page?");
    }
    const pe = props.context.getPageEditor(props.context.selection.selectedPage);
    return pe.editorFor(props.shape);
})
let shape: Shape | undefined;
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
}
let x = ref(0), y = ref(0);
let w = ref(0), h = ref(0);
function calcFrame() {
    const xy = props.shape.realXY();
    x.value = xy.x;
    y.value = xy.y;
    const frame = props.shape.frame;
    w.value = frame.width;
    h.value = frame.height;
}
function setupWatcher() {
    if (!shape) {
        shape = props.shape;
        shape.watch(watcher);
    }
    else if (shape.id != props.shape.id) {
        shape.unwatch(watcher);
        shape = props.shape;
        shape.watch(watcher);
    }
}
onMounted(() => {
    setupWatcher();
    calcFrame();
})
onUnmounted(() => {
    if (shape) {
        shape.unwatch(watcher);
        shape = undefined;
    }
})
onBeforeUpdate(() => {
    setupWatcher();
    calcFrame();
})
const fix = 2;

function onChangeX(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    let x: number = Number.parseFloat(value);
    if (props.shape.frame.x.toFixed(fix) != value && props.context.selection.selectedPage) {
        const xy = props.shape.realXY();
        editor.value.translateTo(x, xy.y);
    }
}
function onChangeY(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    let y: number = Number.parseFloat(value);
    if (props.shape.frame.y.toFixed(fix) != value && props.context.selection.selectedPage) {
        const xy = props.shape.realXY();
        editor.value.translateTo(xy.x, y);
    }
}
function onChangeW(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const w: number = Number.parseFloat(value);
    if (props.shape.frame.width.toFixed(fix) != value && props.context.selection.selectedPage) {
        editor.value.expandTo(w, props.shape.frame.height);
    }
}
function onChangeH(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const h: number = Number.parseFloat(value);
    if (props.shape.frame.height.toFixed(fix) != value && props.context.selection.selectedPage) {
        editor.value.expandTo(props.shape.frame.width, h);
    }
}

</script>

<template>
    <div class="table" :reflush="reflush">
        <div class="tr">
            <IconText class="td" ticon="X" :text="x.toFixed(fix)" @onchange="onChangeX"/>
            <IconText class="td" ticon="Y" :text="y.toFixed(fix)" @onchange="onChangeY"/>
        </div>
        <div class="tr">
            <IconText class="td" ticon="W" :text="w.toFixed(fix)" @onchange="onChangeW"/>
            <IconText class="td" ticon="H" :text="h.toFixed(fix)" @onchange="onChangeH"/>
        </div>
    </div>
</template>

<style scoped>
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 2px;
    padding-right: 1px;
    box-sizing: border-box;
}

.tr {
    width: 100%;
    height: 30px;
    align-items: center;
    display: flex;
    flex-direction: row;
}

.td {
    width: 50%;
}
</style>