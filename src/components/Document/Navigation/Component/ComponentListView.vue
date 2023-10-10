<script setup lang="ts">
import { Context } from '@/context';
import ComponentCard from './ComponentCard.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import { GroupShape, Shape, SymbolShape } from '@kcdesign/data';
import { shape_track } from '@/utils/content';
import { ClientXY } from '@/context/selection';
interface Props {
    context: Context
    data: SymbolShape[]
}
const props = defineProps<Props>();
const compos = ref<Shape[]>([]);
const dragActiveDis = 4; // 拖动 4px 后开始触发移动
let compo: Shape;
let down_position: ClientXY = { x: 0, y: 0 };
let is_drag: boolean = false;
const reflush = ref<number>(0);
const list_container = ref<HTMLDivElement>();
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
function gen_columns() {
    const repeat = Math.floor(((props.context.workspace.root.x - 16) / 106));
    return `repeat(${repeat},100px)`;
}
const observer = new ResizeObserver(() => { reflush.value++; });
function init() {
    list_container.value && observer.observe(list_container.value);
}

onMounted(() => {
    init();
})
onUnmounted(() => {
    observer && observer.disconnect();
})
</script>
<template>
    <div class="list-contianer" ref="list_container" :style="{ 'grid-template-columns': gen_columns() }" :reflush="reflush">
        <ComponentCard v-for="(item, index) in props.data" :key="index" :data="(item as GroupShape)" :context="props.context"
            @mousedown="(e: MouseEvent) => down(e, item as unknown as Shape)">
        </ComponentCard>
    </div>
</template>
<style scoped lang="scss">
.list-contianer {
    width: 100%;
    display: grid;
    grid-gap: 8px;
    grid-auto-rows: 100px;
    padding: 4px 0px 8px 0px;
    box-sizing: border-box;
}
</style>