/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang='ts'>
import { Shape, ShapeView } from "@kcdesign/data";
import { computed, ref } from 'vue';
import { Context } from '@/context'
import SvgIcon from "@/components/common/SvgIcon.vue";

interface Props {
    context: Context,
    layers?: ShapeView[],
}

const emit = defineEmits<{
    (e: 'close'): void
}>();
const selectedShapes = computed(() => props.context.selection.selectedShapes);
const props = defineProps<Props>();
const hoverItem = ref('');

function select(shape: ShapeView) {
    props.context.selection.selectShape(shape);
    emit('close');
}

function mouseenter(shape: ShapeView) {
    props.context.selection.hoverShape(shape);
    hoverItem.value = shape.id;
}

function mouseout() {
    props.context.selection.unHoverShape();
    hoverItem.value = '';
}
import white_select_icon from '@/assets/icons/svg/white-select.svg';
import page_select_icon from '@/assets/icons/svg/page-select.svg';

</script>
<template>
<div class="items-wrap">
    <div class="item" v-for="shape in props.layers" :key="shape.id" @click="select(shape)"
         @mouseenter="() => mouseenter(shape)" @mouseleave="mouseout">
        <div>
            <SvgIcon :icon="hoverItem === shape.id ? white_select_icon : page_select_icon"
                      v-if="selectedShapes.find(i => i.id === shape.id)"/>
        </div>
        <span :style="{ marginLeft: selectedShapes ? '8px' : '20px' }">{{ shape.name }}</span>
    </div>
</div>
</template>
<style lang='scss' scoped>
.items-wrap {
    width: 100%;
    font-size: var(--font-default-fontsize);
    overflow-x: auto;

    .item {
        height: 32px;
        width: 100%;
        color: #262626;
        box-sizing: border-box;
        padding: 9px 0 9px 8px;
        display: flex;
        align-items: center;

        > div {
            width: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            > svg {
                width: 12px;
                height: 12px;
            }
        }

        > span {
            //margin-left: var(--default-margin-half);
            display: inline-block;
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }

    .item:hover {
        background-color: var(--active-color);
        color: #FFFFFF;
    }

    &::-webkit-scrollbar {
        width: 7px;
    }

    &::-webkit-scrollbar-thumb {
        border-radius: 3.5px;
        background: #efefef;
    }
}

</style>