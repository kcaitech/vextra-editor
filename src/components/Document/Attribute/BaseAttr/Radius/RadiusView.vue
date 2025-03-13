/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import MossInput2 from '@/components/common/MossInput2.vue';

import radius_icon from "@/assets/icons/svg/radius.svg";
import SvgIcon from '@/components/common/SvgIcon.vue';
import white_for_radius_icon from "@/assets/icons/svg/white-for-radius.svg";
import more_for_radius_icon from "@/assets/icons/svg/more-for-radius.svg";
import { get_value_from_input, RadiusContextMgr } from './ctx';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import { LockMouse } from '@/transform/lockMouse';
import { ref } from 'vue';
import { LinearApi } from '@kcdesign/data';
import { sortValue } from '../oval';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
    context: Context;
    manager: RadiusContextMgr;
    data: (number | string)[];
    disabled: boolean;
}>();
const keyupdate = ref<boolean>(false);
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!);
function change(value: any, index: number) {
    value = get_value_from_input(value);

    if (props.manager.radiusCtx.rect) {
        setting_for_extend(value, index);
        return;
    }
    props.manager.modifyRadius([value]);
}

function setting_for_extend(val: number, index: number) {
    const values = [-1, -1, -1, -1];
    values[index] = val;

    if (keyupdate.value) {
        linearApi.shapesModifyRadius(props.manager.flat, values);
    } else {
        props.manager.modifyRadius(values);
    }
}

const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let lockMouseHandler: LockMouse | undefined = undefined;

function updatePosition(movementX: number, movementY: number) {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    telX.value += movementX;
    telY.value += movementY;
    telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
    telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}

async function dragstart(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }

    lockMouseHandler = new LockMouse(props.context, e, props.manager.flat);
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

function dragging(e: MouseEvent, which: number) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler || isNaN(Number(props.data[which]))) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    let values = [-1, -1, -1, -1];
    values[which] = Math.max(Number(props.data[which]) + e.movementX, 0);

    if (!props.manager.radiusCtx.rect) {
        values = [values[0]]
    }

    lockMouseHandler.executeRadius(values);
}

function dragend() {
    tel.value = false;
    document.exitPointerLock();

    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
    document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        dragend();
    }
}

function checkKeyup(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keyupdate.value = false;
    }
}

function keydownRadius(event: KeyboardEvent, index: number) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keyupdate.value = true;
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = props.manager.flat;
        value = get_value_from_input(value);
        if (props.manager.radiusCtx.rect) {
            setting_for_extend(value, index);
        } else {
            linearApi.shapesModifyRadius(shapes, [value]);
        }
        event.preventDefault();
    }
}

</script>

<template>
    <div class="tr">
        <MossInput2 :icon="radius_icon" :draggable="typeof data[0] === 'number'" :value="data[0]" :disabled="disabled"
            @change="value => change(value, 0)" @dragstart="dragstart" @dragging="(e) => dragging(e, 0)"
            @dragend="dragend" @keydown="keydownRadius($event, 0)" @keyup="checkKeyup">
        </MossInput2>
        <div class="space" v-if="!manager.radiusCtx.rect"></div>
        <MossInput2 v-if="manager.radiusCtx.rect" class="r-90" :icon="radius_icon" :draggable="typeof data[1] === 'number'"
            :value="data[1]" :disabled="disabled" @change="value => change(value, 1)" @dragstart="dragstart"
            @dragging="(e) => dragging(e, 1)" @dragend="dragend" @keydown="keydownRadius($event, 1)"
            @keyup="checkKeyup">
        </MossInput2>
        <Tooltip v-if="manager.can_be_rect" :content="t('attr.independentCorners')">
            <div class="more-for-radius" @click="manager.rectToggle()" :class="{ 'active': manager.radiusCtx.rect }">
                <SvgIcon :icon="manager.radiusCtx.rect ? white_for_radius_icon : more_for_radius_icon"
                    :class="{ 'active': manager.radiusCtx.rect }" />
            </div>
        </Tooltip>
    </div>
    <div class="tr" v-if="manager.radiusCtx.rect">
        <MossInput2 class="r-270" :icon="radius_icon" :draggable="typeof data[3] === 'number'" :value="data[3]"
            :disabled="disabled" @change="value => change(value, 3)" @dragstart="dragstart"
            @dragging="(e) => dragging(e, 3)" @dragend="dragend" @keydown="keydownRadius($event, 3)"
            @keyup="checkKeyup">
        </MossInput2>
        <MossInput2 class="r-180" :icon="radius_icon" :draggable="typeof data[2] === 'number'" :value="data[2]"
            :disabled="disabled" @change="value => change(value, 2)" @dragstart="dragstart"
            @dragging="(e) => dragging(e, 2)" @dragend="dragend" @keydown="keydownRadius($event, 2)"
            @keyup="checkKeyup"></MossInput2>
        <div style="width: 32px;height: 32px;"></div>
    </div>
    <teleport to="body">
        <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
        </div>
    </teleport>
</template>

<style scoped lang="scss">
.tr {
    position: relative;
    width: 100%;
    height: 30px;
    align-items: center;
    justify-content: space-between;
    display: flex;
    flex-direction: row;
    gap: 8px;

    .container {
        display: flex;
        align-items: center;
        border: 1px solid transparent;
        box-sizing: border-box;
        background-color: var(--input-background);
        border-radius: var(--default-radius);
        width: 88px;

        img {
            width: 12px;
            height: 12px;
            padding-right: 8px;
        }
    }

    .space {
        width: 88px;
        height: 32px;
    }

    .more-for-radius {
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        box-sizing: border-box;
        border: 1px solid #F0F0F0;
        padding: 9px;

        >img {
            transition: 0.3s;
            color: #808080;
            width: 13px;
            height: 13px;
        }

        >img.active {
            color: #FFFFFF;
        }
    }

    .more-for-radius:hover {
        background: #F4F5F5;
    }

    .more-for-radius.active {
        background-color: var(--active-color);
        border: 1px solid var(--active-color);
    }

    .r-90 {
        :deep(img) {
            transform: rotate(90deg);
        }
    }

    .r-180 {
        :deep(img) {
            transform: rotate(180deg);
        }
    }

    .r-270 {
        :deep(img) {
            transform: rotate(270deg);
        }
    }
}

.point {
    position: absolute;
    width: 24px;
    height: 24px;
    background-image: url("@/assets/cursor/scale.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 32px;
    z-index: 10000;
}
</style>