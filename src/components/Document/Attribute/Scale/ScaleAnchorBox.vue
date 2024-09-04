<script setup lang="ts">
import { ref } from "vue";
import { AnchorType } from "./index";
import { useI18n } from "vue-i18n";

const t = useI18n().t;

const WIDTH = 72;
const WIDTH_CSS = WIDTH + 'px';
const HEIGHT = 72
const HEIGHT_CSS = HEIGHT + 'px';
const types = ref<{ type: AnchorType, selected: boolean, tips: string }[]>([
    { type: AnchorType.LeftTop, selected: false, tips: t('attr.scale_from_lt') },
    { type: AnchorType.Top, selected: false, tips: t('attr.scale_from_top') },
    { type: AnchorType.RightTop, selected: false, tips: t('attr.scale_from_rt') },
    { type: AnchorType.Left, selected: false, tips: t('attr.scale_from_left') },
    { type: AnchorType.Center, selected: true, tips: t('attr.scale_from_center') },
    { type: AnchorType.Right, selected: false, tips: t('attr.scale_from_right') },
    { type: AnchorType.BottomLeft, selected: false, tips: t('attr.scale_from_lb') },
    { type: AnchorType.Bottom, selected: false, tips: t('attr.scale_from_bottom') },
    { type: AnchorType.RightBottom, selected: false, tips: t('attr.scale_from_rb') }
]);

const emit = defineEmits<{
    (e: 'update:type', type: AnchorType): void;
}>();

const tips = ref<string>(t('attr.scale_from_center'));

function setAnchor(t: AnchorType) {
    const __selected = types.value.find(i => i.selected);
    const target = types.value.find(i => i.type === t);
    if (__selected) __selected.selected = false;
    if (target && !target.selected) {
        target.selected = true;
        emit('update:type', t);
        tips.value = target.tips;
    }
}

</script>
<template>
<div style="display: flex;gap: 4px; align-items: center;">
    <div :style="{width: WIDTH_CSS, height: HEIGHT_CSS}" class="scale-anchor-box">
        <div v-for="t in types" :key="t.type" class="item" @click="() => setAnchor(t.type)">
            <div style="width: 3px; height: 3px; border-radius: 50%; background-color: #bfbfbf; position: absolute;"/>
            <div :class="{content: true, 'selected-content': t.selected}"/>
        </div>
    </div>
    <span>{{ tips }}</span>
</div>

</template>
<style scoped lang="scss">
.scale-anchor-box {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 2px;
    background-color: var(--input-background);
    border-radius: var(--default-radius);
    border: 1px solid rgba(0, 0, 0, 0.08);

    .item {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        .content {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 2px;
            background-color: transparent;
        }

        .selected-content {
            background-color: var(--active-color) !important;
        }

    }

    .item:hover {
        .content {
            background-color: #76a8ea;
        }
    }
}
</style>