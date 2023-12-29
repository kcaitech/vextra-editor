<script lang="ts" setup>
import { Context } from "@/context";
import PlatformSelected from './PlatformSelected.vue';
import LableLayerInfo from "./LableLayerInfo.vue";
import LableFill from "./LableFill.vue";
import LableBorder from "./LableBorder.vue";
import LableText from "./LableText.vue";
import LableCode from "./LableCode.vue"
import LableMultiSelect from "./LableMultiSelect.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { Selection } from '@/context/selection';
import { Shape, ShapeType } from "@kcdesign/data";
import { useI18n } from 'vue-i18n'

const {t} = useI18n();
const props = defineProps<{
    context: Context
}>();
const shapes = ref<Shape[]>([]);
const len = ref(0);
const shapeType = ref();
const getShapeInfo = () => {
    if (props.context.selection.selectedShapes.length === 1) {
        shapes.value = new Array(...props.context.selection.selectedShapes);
        shapeType.value = shapes.value[0].type;
    } else if (props.context.selection.selectedShapes.length > 1) {
        shapes.value = new Array(...props.context.selection.selectedShapes);
    } else {
        shapes.value = new Array();
    }
    len.value = shapes.value.length;
}
const selection_watcher = (t: number) => {
    if (t === Selection.CHANGE_PAGE || t === Selection.CHANGE_SHAPE) {
        getShapeInfo();
    }
}
onMounted(() => {
    getShapeInfo();
    props.context.selection.watch(selection_watcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>

<template>
    <div class="container">
        <el-scrollbar v-if="len > 0">
            <PlatformSelected v-if="len === 1" :context="context"></PlatformSelected>
            <LableMultiSelect v-if="len > 1"></LableMultiSelect>
            <LableLayerInfo v-if="len === 1" :context="context"></LableLayerInfo>
            <LableFill v-if="len === 1 && shapes[0].style.fills.length > 0" :context="context"></LableFill>
            <LableBorder v-if="len === 1 && shapes[0].style.borders.length > 0" :context="context"></LableBorder>
            <LableText v-if="len === 1 && shapeType === ShapeType.Text" :context="context"></LableText>
            <!-- <LableCode v-if="len > 0" :context="context"></LableCode> -->
        </el-scrollbar>
        <div class="blank" v-if="len === 0">{{t('lable.selectLayer')}}</div>
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