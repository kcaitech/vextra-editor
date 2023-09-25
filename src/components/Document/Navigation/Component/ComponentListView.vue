<script setup lang="ts">
import { Context } from '@/context';
import ComponentCard from './ComponentCard.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { GroupShape, Shape } from '@kcdesign/data';
import { shape_track } from '@/utils/content';
import { ClientXY } from '@/context/selection';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const compos = ref<Shape[]>([]);
const dragActiveDis = 4; // 拖动 4px 后开始触发移动
let compo: Shape;
let down_position: ClientXY = { x: 0, y: 0 };
let is_drag: boolean = false;
function loader_view() {
    compos.value.length = 0;
    const mgr = props.context.data.symbolsMgr;
    compos.value = mgr.resource;
}
function down(e: MouseEvent, shape: Shape) {
    compo = shape;
    const root = props.context.workspace.root;
    down_position = { x: e.clientX - root.x, y: e.clientY - root.y };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
}
function move(e: MouseEvent) {
    const root = props.context.workspace.root;
    const curr_position = { x: e.clientX - root.x, y: e.clientY - root.y };
    if (is_drag) {
        // todo
    } else if (Math.hypot(curr_position.x - down_position.x, curr_position.y - down_position.y) > dragActiveDis) {
        is_drag = true;
        props.context.component.set_brige_status(true);
        props.context.component.register_wonder(compo);
    }
}
function up() {
    if (is_drag) {
        is_drag = false;
    } else {
        shape_track(props.context, compo);
    }
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
onMounted(() => {
    props.context.data.pagesMgr.watch(loader_view);
    props.context.data.symbolsMgr.watch(loader_view);
    loader_view();
})
onUnmounted(() => {
    props.context.data.pagesMgr.unwatch(loader_view);
    props.context.data.symbolsMgr.unwatch(loader_view);
})
</script>
<template>
    <div class="list-contianer">
        <ComponentCard v-for="(item, index) in compos" :key="index" :data="(item as GroupShape)"
            @mousedown="(e: MouseEvent) => down(e, item as unknown as Shape)">
        </ComponentCard>
    </div>
</template>
<style scoped lang="scss">
.list-contianer {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: grid;
    grid-gap: 8px;
    grid-template-columns: 100px 100px;
    grid-auto-rows: 100px;

    &::-webkit-scrollbar {
        width: 0px;
    }

    &::-webkit-scrollbar-track {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb:active {
        background-color: none;
    }
}
</style>