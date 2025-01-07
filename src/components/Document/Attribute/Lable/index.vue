<script lang="ts" setup>
import { Context } from "@/context";
import PlatformSelected from './PlatformSelected.vue';
import LableLayerInfo from "./LableLayerInfo.vue";
import LableFill from "./LableFill.vue";
import LableBorder from "./LableBorder.vue";
import LableText from "./LableText.vue";
import LableMultiSelect from "./LableMultiSelect.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { Selection } from '@/context/selection';
import { ShapeType, ShapeView } from "@kcdesign/data";
import { useI18n } from 'vue-i18n';
import CutoutExport from "../CutoutExport/index.vue"
import { debounce } from "lodash";

const { t } = useI18n();
const props = defineProps<{
    context: Context
}>();
const shapes = ref<ShapeView[]>([]);
const len = ref(0);
const shapeType = ref();
const reflush_by_selection = ref<number>(0);
const reflush_trigger = ref<any[]>([]);
const getShapeInfo = () => {
    const _shapes = props.context.selection.selectedShapes;
    if (_shapes.length === 1) {
        shapes.value = new Array(..._shapes);
        shapeType.value = shapes.value[0].type;
    } else if (_shapes.length > 1) {
        shapes.value = new Array(..._shapes);
    } else {
        shapes.value = new Array();
    }
    len.value = shapes.value.length;
}

function _selection_change() {
    getShapeInfo();
    reflush_by_selection.value++;
}
const selection_change = debounce(_selection_change, 160, { leading: true });

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE || t === Selection.CHANGE_PAGE) {
        selection_change();
        watch_shapes();
    }
}

function update_by_shapes(...args: any[]) {
    reflush_trigger.value = [...(args?.length ? args : [])];
}
const watchedShapes = new Map<string, ShapeView>();
function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update_by_shapes);
        watchedShapes.delete(k);
    })

    const selectedShapes = props.context.selection.selectedShapes;
    selectedShapes.forEach((v) => {
        v.watch(update_by_shapes);
        watchedShapes.set(v.id, v)
    });
}

onMounted(() => {
    watch_shapes();
    getShapeInfo();
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
    watchedShapes.forEach(v => {
        v.unwatch(update_by_shapes);
    });
})
</script>

<template>
    <div class="container">
        <el-scrollbar v-if="len > 0">
            <PlatformSelected v-if="len === 1" :context="context"></PlatformSelected>
            <LableMultiSelect v-if="len > 1"></LableMultiSelect>
            <LableLayerInfo v-if="len === 1" :context="context"></LableLayerInfo>
            <LableFill v-if="len === 1 && shapes[0].getFills().length > 0" :context="context"></LableFill>
            <LableBorder v-if="len === 1 && shapes[0].getBorders().length > 0" :context="context"></LableBorder>
            <LableText v-if="len === 1 && shapeType === ShapeType.Text" :context="context"></LableText>
            <!-- <LableCode v-if="len > 0" :context="context"></LableCode> -->
            <CutoutExport :shapes="(shapes as ShapeView[])" :context="props.context" :trigger="reflush_trigger"></CutoutExport>
        </el-scrollbar>
        <div class="blank" v-if="len === 0">{{ t('lable.selectLayer') }}</div>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    font-size: var(--font-default-fontsize);
}

.blank {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    overflow: hidden;
}
</style>