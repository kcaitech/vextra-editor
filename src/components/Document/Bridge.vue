<script lang="ts" setup>
import { Context } from '@/context';
import ComponentWonderCard from '@/components/Document/Navigation/Component/ComponentWonderCard.vue'
import { onMounted, onUnmounted, ref } from 'vue';
import { GroupShape, Shape } from '@kcdesign/data';
import { Component } from '@/context/component';
import { get_symbol_ref_name, is_content, ref_symbol } from '@/utils/content';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const wonder = ref<Shape>();
const wonder_card_x = ref<number>();
const wonder_card_y = ref<number>();
let wonder_stash: Shape;
function component_watcher(t: number) {
    if (t === Component.WONDER_CHANGE) wonder.value = props.context.component.wonder;
}
function check_status() {
    const w = props.context.component.wonder;
    if (w) {
        wonder_stash = w;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    }
}
function move(e: MouseEvent) {
    if (!wonder.value && wonder_stash) wonder.value = wonder_stash;
    modify_wonder_xy(e);
}
function up(e: MouseEvent) {
    if (is_content(props.context, e) && wonder.value) {
        const locate = get_position_on_page(e);
        const name = get_symbol_ref_name(wonder.value.name, wonder.value.id, Array.from(props.context.selection.selectedPage!.shapes.values()));
        ref_symbol(props.context, locate, name, wonder.value);
    } else {
        console.log('区外');
    }
    props.context.component.set_brige_status(false);
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
function modify_wonder_xy(e: MouseEvent) {
    wonder_card_x.value = e.clientX - 50;
    wonder_card_y.value = e.clientY - 50;
}
function get_position_on_page(e: MouseEvent) {
    const matirx = props.context.workspace.matrix;
    const root = props.context.workspace.root;
    return matirx.inverseCoord(e.clientX - root.x, e.clientY - root.y);
}
onMounted(() => {
    props.context.watch(component_watcher);
    check_status();
})
onUnmounted(() => {
    props.context.unwatch(component_watcher);
})
</script>
<template>
    <div class="bridge">
        <div class="wonder-wrap" :style="{ left: wonder_card_x + 'px', top: wonder_card_y + 'px' }">
            <ComponentWonderCard v-if="wonder" :data="(wonder as GroupShape)"></ComponentWonderCard>
        </div>
    </div>
</template>
<style scoped lang="scss">
.bridge {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 1005;
    left: 0px;
    top: 0px;

    .wonder-wrap {
        position: absolute;
    }
}
</style>