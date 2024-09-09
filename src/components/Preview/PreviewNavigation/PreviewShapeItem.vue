<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Shape, ShapeView } from '@kcdesign/data';
import { Context } from "@/context";
import { get_name } from "@/utils/shapelist";
import { useI18n } from 'vue-i18n';
import ShapeCard from "./PreviewShapeCard.vue";
import StaticShape from "@/components/Document/Content/StaticShape.vue";

export interface ItemData {
    id: string
    shape: () => ShapeView // 作用function，防止vue对shape内部数据进行proxy
    selected: boolean
    context: Context
}

interface Props {
    data: ItemData
}

const emit = defineEmits<{
    (e: 'selectShape', shape: ShapeView): void;
}>();

const props = defineProps<Props>();

const shapeItem = ref<HTMLDivElement | null>(null);
const t = useI18n().t;

const hovered = ref(false);

const selectShape = () => {
    emit("selectShape", props.data.shape());
}

onMounted(() => {
})
onUnmounted(() => {
    stop();
})
</script>

<template>
<div ref="shapeItem"
     :class="{ container: true, selected: props.data.selected, hovered: hovered && !props.data.selected }"
     @click="selectShape">
    <div class="container-svg zero-symbol">
        <StaticShape :shape="data.shape()" :context="data.context"/>
    </div>
    <div class="text">
        <div class="txt">{{ get_name(props.data.shape(), t('compos.dlt')) }}</div>
    </div>
</div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: calc(100% - 6px);
    height: 52px;
    padding-left: 12px;
    box-sizing: border-box;


    > .container-svg {
        width: 38px;
        height: 38px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 5px;
        border: 1px solid rgba(0, 0, 0, 0.25);
        border-radius: 2px;
        box-sizing: border-box;
    }

    > .text {
        flex: 1;
        line-height: 30px;
        font-size: var(--font-default-fontsize);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        display: flex;
        flex-flow: row;
        align-items: center;
        width: 100%;
        height: 30px;
        color: var(--left-navi-font-color);
        background-color: transparent;

        > .txt {
            width: 100%;
            height: 30px;
            line-height: 30px;
            font-size: 12px;
            color: #262626;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 2px;
        }
    }

}

.container:hover {
    z-index: -1;
    border-radius: 8px;
    background-color: #efefef;
}

.selected {
    z-index: 1;
    border-radius: 8px;
    background-color: rgba($color: #1878F5, $alpha: 0.2) !important;
}

.hovered {
    border-radius: var(--default-radius);
    background-color: #efefef;
}
</style>