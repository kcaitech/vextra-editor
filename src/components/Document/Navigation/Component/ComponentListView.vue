<script setup lang="ts">
import { Context } from '@/context';
import ComponentCardAlpha from './ComponentCardAlpha.vue';
import ComponentCardBeta from './ComponentCardBeta.vue';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { GroupShape, Shape, SymbolShape } from '@kcdesign/data';
import { shape_track } from '@/utils/content';
import { ClientXY } from '@/context/selection';
import { is_dbl_action } from '@/utils/action';
import {
    add_blur_for_window, add_move_and_up_for_document, check_drag_action,
    get_current_position_client, modify_down_position_client, remove_blur_from_window,
    remove_move_and_up_from_document
} from '@/utils/mouse_interactive';
import { Component } from '@/context/component';

interface Props {
    context: Context
    data: SymbolShape[]
    container: Element | null
    isAttri: boolean
}

const props = defineProps<Props>();
let compo: Shape;
let down_position: ClientXY = { x: 0, y: 0 };
let is_drag: boolean = false;
const render_alpha = ref<boolean>(Boolean(props.context.component.card_type === 'alpha'));
const reflush = ref<number>(0);
const list_container_beta = ref<HTMLDivElement>();
let observer = new ResizeObserver(() => { reflush.value++; });

function down(e: MouseEvent, shape: Shape) {
    if (props.isAttri) {
        props.context.component.notify(Component.SELECTED_VAL, shape);
        return;
    }
    if (e.button === 2) {
        props.context.component.compMenuMount(shape, e);
        return;
    }
    if (is_dbl_action()) {
        shape_track(props.context, shape);
        return;
    }
    compo = shape;
    modify_down_position_client(props.context, e, down_position);
    add_move_and_up_for_document(move, up);
}
function move(e: MouseEvent) {
    const curr_position = get_current_position_client(props.context, e);
    if (is_drag) return;
    if (check_drag_action(down_position, curr_position)) {
        is_drag = true;
        props.context.component.set_brige_status(true);
        props.context.component.register_wonder(compo);
    }
}

function up() {
    if (is_drag) is_drag = false;
    remove_move_and_up_from_document(move, up);
}

function gen_columns() {
    const repeat = Math.floor(((props.context.workspace.root.x - 16) / 106));
    return `repeat(${repeat}, 100px)`;
}
function init() {
    const type = props.context.component.card_type;
    if (type === 'alpha') {
        render_alpha.value = true;
    } else {
        render_alpha.value = false;
        nextTick(() => {
            if (list_container_beta.value) observer.observe(list_container_beta.value);
        })
    }
}
function component_watcher(t: number) {
    if (t === Component.CARD_TYPE_CHANGE) modify_render_type();
}
function modify_render_type() {
    const type = props.context.component.card_type;
    if (type === 'alpha') {
        render_alpha.value = true;
        if (list_container_beta.value) observer.disconnect();
    } else {
        render_alpha.value = false;
        nextTick(() => {
            if (list_container_beta.value) observer.observe(list_container_beta.value);
        })
    }
    reflush.value = 0;
}
function window_blur() {
    is_drag = false;
    remove_move_and_up_from_document(move, up);
}

onMounted(() => {
    init();
    add_blur_for_window(window_blur);
    props.context.component.watch(component_watcher);
})
onUnmounted(() => {
    observer && observer.disconnect();
    remove_blur_from_window(window_blur);
    props.context.component.unwatch(component_watcher);
})
</script>
<template>
    <div v-if="render_alpha" class="list-container-alpha">
        <ComponentCardAlpha v-for="(item, index) in props.data" :key="index" :data="(item as GroupShape)"
            :context="props.context" @mousedown="(e: MouseEvent) => down(e, item as unknown as Shape)"
            :container="props.container">
        </ComponentCardAlpha>
    </div>
    <div v-else class="list-container-beta" ref="list_container_beta" :style="{ 'grid-template-columns': gen_columns() }"
        :reflush="reflush">
        <ComponentCardBeta v-for="(item, index) in props.data" :key="index" :data="(item as GroupShape)"
            :context="props.context" @mousedown="(e: MouseEvent) => down(e, item as unknown as Shape)"
            :container="props.container">
        </ComponentCardBeta>
    </div>
</template>
<style scoped lang="scss">
.list-container-beta {
    width: 100%;
    display: grid;
    grid-gap: 8px;
    grid-auto-rows: 100px;
    padding: 4px 0px 8px 0px;
    box-sizing: border-box;
}
</style>