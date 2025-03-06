/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { ShapeView } from '@kcdesign/data';
import { Context } from "@/context";
import { get_name } from "@/utils/shapelist";
import { useI18n } from 'vue-i18n';
import StaticShape from "@/components/Document/Content/StaticShape.vue";

export interface ItemData {
    id: string;
    shape: () => ShapeView;
    selected: boolean;
    context: Context;
}

interface Props {
    data: ItemData
}

const emits = defineEmits<{
    (e: 'selectShape', shape: ShapeView): void;
}>();

const props = defineProps<Props>();

const shapeItem = ref<HTMLDivElement | null>(null);
const t = useI18n().t;

const hovered = ref(false);

const selectShape = () => {
    emits("selectShape", props.data.shape());
}

onUnmounted(stop);
</script>

<template>
<div ref="shapeItem"
     :class="{ container: true, selected: props.data.selected, hovered: hovered && !props.data.selected }"
     @click="selectShape">
    <div class="content">
        <StaticShape :context="data.context" :shape="data.shape()" :size="34"/>
    </div>
    <div class="text">
        <div class="txt">{{ get_name(props.data.shape(), t('compos.dlt')) }}</div>
    </div>
</div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    gap: 6px;
    flex-flow: row;
    align-items: center;
    width: calc(100% - 6px);
    height: 52px;
    padding-left: 12px;
    box-sizing: border-box;
    border-radius: 8px;

    > .content {
        width: 38px;
        height: 38px;
        display: flex;
        justify-content: center;
        align-items: center;
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
    background-color: #efefef;
}

.selected {
    z-index: 1;
    background-color: rgba($color: #1878F5, $alpha: 0.2) !important;
}

.hovered {
    background-color: #efefef;
}
</style>