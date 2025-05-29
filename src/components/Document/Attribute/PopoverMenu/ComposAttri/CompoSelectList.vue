/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import CardWrap from "./CardWrap.vue";
import { ShapeView } from "@kcdesign/data";

interface Props {
    context: Context
    contents: any[]
    container: Element | null
    layerId?: string[]
}

interface Emits {
    (e: 'change', value: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

function checked(id: string) {
    return (props.layerId || []).includes(id);
}

function hover_item(shape: ShapeView) {
    props.context.selection.hoverShape(shape);
}

function unhover() {
    props.context.selection.unHoverShape();
}

function change(v: string) {
    emits('change', v);
}
import select_icon from '@/assets/icons/svg/select.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
</script>
<template>
    <div class="container" @mouseleave="unhover">
        <div class="item" v-for="(item, index) in contents" :key="index" @mouseenter.stop="() => hover_item(item)"
            @click="() => change(item.id)">
            <div :class="checked(item.id) ? 'visibility' : 'hidden'">
                <SvgIcon :icon="select_icon"/>
            </div>
            <CardWrap :data="item" :container="props.container"></CardWrap>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    padding: 0 5px 0 12px;
    box-sizing: border-box;

    .item {
        display: flex;
        align-items: center;
        padding: 0 4px;

        .visibility {
            flex: 0 0 14px;
            width: 14px;
            height: 14px;
            background-color: var(--active-color);
            box-sizing: border-box;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 4px;
            margin-right: 4px;

            >svg {
                width: 60%;
                height: 60%;
            }
        }

        .hidden {
            flex: 0 0 14px;
            width: 14px;
            height: 14px;
            background: #FFFFFF;
            border-radius: 4px;
            border: 1px solid #EBEBEB;
            box-sizing: border-box;
            margin-right: 4px;

            >svg {
                display: none;
            }
        }
    }

    .item:hover {
        background-color: #F5F5F5;
    }
}
</style>