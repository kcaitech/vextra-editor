<script setup lang="ts">
import { defineProps, onBeforeUpdate, onMounted, onUnmounted, ref } from 'vue'
import { Shape } from '@/data/shape';
import IconText from '../common/IconText.vue';
import { Context } from '@/context';
const props = defineProps<{ context: Context, shape: Shape }>();
let shape: Shape | undefined;
const reflush = ref(0);
const watcher = () => {
    reflush.value++;
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
    // props.shape.watch(watcher);
    setupWatcher();
})
onUnmounted(() => {
    // props.shape.unwatch(watcher);
    if (shape) {
        shape.unwatch(watcher);
        shape = undefined;
    }
})
onBeforeUpdate(() => {
    setupWatcher();
})
const fix = 2;

function onChangeX(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const x: number = Number.parseFloat(value);
    if (props.shape.frame.x.toFixed(fix) != value && props.context.selection.selectedPage) {
        const editor = props.context.getPageEditor(props.context.selection.selectedPage)
        editor.modify(props.shape, 'x', x);
    }
}
function onChangeY(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const x: number = Number.parseFloat(value);
    if (props.shape.frame.y.toFixed(fix) != value && props.context.selection.selectedPage) {
        const editor = props.context.getPageEditor(props.context.selection.selectedPage)
        editor.modify(props.shape, 'y', x);
    }
}
function onChangeW(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const x: number = Number.parseFloat(value);
    if (props.shape.frame.width.toFixed(fix) != value && props.context.selection.selectedPage) {
        const editor = props.context.getPageEditor(props.context.selection.selectedPage)
        editor.modify(props.shape, 'w', x);
    }
}
function onChangeH(value: string) {
    // console.log(value)
    value = Number.parseFloat(value).toFixed(fix);
    const x: number = Number.parseFloat(value);
    if (props.shape.frame.height.toFixed(fix) != value && props.context.selection.selectedPage) {
        const editor = props.context.getPageEditor(props.context.selection.selectedPage)
        editor.modify(props.shape, 'h', x);
    }
}

</script>

<template>
    <div class="table" :reflush="reflush">
        <div class="tr">
            <IconText class="td" ticon="X" :text="props.shape.frame.x.toFixed(fix)" @onchange="onChangeX"/>
            <IconText class="td" ticon="Y" :text="props.shape.frame.y.toFixed(fix)" @onchange="onChangeY"/>
        </div>
        <div class="tr">
            <IconText class="td" ticon="W" :text="props.shape.frame.width.toFixed(fix)" @onchange="onChangeW"/>
            <IconText class="td" ticon="H" :text="props.shape.frame.height.toFixed(fix)" @onchange="onChangeH"/>
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