<script setup lang="ts">
import { Context } from '@/context';
import { GradientType, Matrix } from '@kcdesign/data';
import { onMounted, ref } from 'vue';
import { gradient_map } from "./map";
import { dbl_action } from '@/utils/mouse_interactive';
import { Selection } from '@/context/selection';
import { onUnmounted } from 'vue';
import { ColorCtx } from '@/context/color';
interface Props {
    context: Context
    params: {
        matrix: Matrix
        visible: boolean
    }
}
const props = defineProps<Props>();
const _g_type = ref<GradientType>(GradientType.Linear);
function init() {
    _g_type.value = props.context.color.gradient_type || GradientType.Linear;
}
function down(e: MouseEvent) {
    e.stopPropagation();
    if (dbl_action()) {
        props.context.color.clear_locat();
        props.context.color.switch_editor_mode(false);
    }
}
function move(e: MouseEvent) {
    if (e.buttons !== 1) {
        e.stopPropagation();
    }
}
const selected_watcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        init();
    }
}
const color_watcher = (t: number) => {
    if (t === ColorCtx.CHANGE_GRADIENT_TYPE) {
        init();
    }
}
onMounted(() => {
    init();
    props.context.selection.watch(selected_watcher);
    props.context.color.watch(color_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selected_watcher);
    props.context.color.unwatch(color_watcher);
})
</script>
<template>
    <div class="gradient" @mousedown.stop="down" @mousemove="move" v-if="params.visible">
        <component :is="gradient_map.get(_g_type)" :context="props.context" :matrix="params.matrix"></component>
    </div>
</template>
<style scoped lang="scss">
.gradient {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 9;
    // background-color: rgba(0, 0, 0, 0.1);
}
</style>