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
import { Context } from '@/context';
import { getSideThickness, StrokeFillContextMgr } from '../ctx';
import BorderDetail from './BorderDetail.vue';
import { BorderPosition, LinearApi, PathShapeView, ShapeType, ShapeView } from '@kcdesign/data';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import thickness_icon from '@/assets/icons/svg/thickness.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useI18n } from 'vue-i18n';
import { genOptions } from '@/utils/common';
import { sortValue } from '../../BaseAttr/oval';
import { LockMouse } from '@/transform/lockMouse';
import Apex from './Apex.vue';
import { onUnmounted, onMounted, ref } from 'vue';
import { Selection } from '@/context/selection';
import { getShapesForStyle } from '@/utils/style';

const { t } = useI18n();

const props = defineProps<{ context: Context; manager: StrokeFillContextMgr; trigger: any[] }>();

const positonOptionsSource: SelectSource[] = genOptions([
    [BorderPosition.Outer, t(`attr.${BorderPosition.Outer}`)],
    [BorderPosition.Center, t(`attr.${BorderPosition.Center}`)],
    [BorderPosition.Inner, t(`attr.${BorderPosition.Inner}`)],
]);
const isActived = ref(false);
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!);

const positoSelected = () => {
    if (props.manager.fillCtx.strokeInfo?.position === 'mixed') {
        return { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
    }
    return positonOptionsSource.find(i => i.data.value === props.manager.fillCtx.strokeInfo?.position)?.data
}

const is_stroke_select = ref(false);
const show_apex = ref(false);
const strokeBlur = () => {
    isActived.value = false;
    is_stroke_select.value = false;
}
const strokeClick = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_stroke_select.value) return;
    el.select();
    is_stroke_select.value = true;
}


function positionSelect(selected: SelectItem) {
    props.manager.modifyBorderPosition(selected.value as BorderPosition);
}

const thickness_value = () => {
    const strokeInfo = props.manager.fillCtx.strokeInfo!;

    if (typeof strokeInfo === 'string' ||
        typeof strokeInfo.sideSetting === 'string' ||
        typeof getSideThickness(strokeInfo.sideSetting) === 'boolean') {
        return t('attr.mixed');
    } else {
        const thickness = getSideThickness(strokeInfo.sideSetting);
        if (!thickness && thickness !== 0) {
            return t('attr.mixed');
        } else {
            return thickness;
        }
    }
}

function setThickness(e: Event) {
    let thickness = Number((e.target as HTMLInputElement).value);
    (e.target as HTMLInputElement).blur();
    if (isNaN(thickness)) return;
    if (thickness > 300) thickness = 300;
    const t = thickness < 0 ? 0 : thickness;
    props.manager.modifyBorderThickness(t);
}

function keydownThickness(event: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    let old = value;
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        if (value >= 0) {
            if (value >= 300) {
                value = 300;
            }
            value = value + (event.code === 'ArrowUp' ? 1 : -1);
            if (isNaN(value)) return;
            value = value <= 0 ? 0 : value <= 300 ? value : 300;
            if (old !== value) linearApi.modifyShapesBorderThickness(props.manager.flat, value);
        }
        event.preventDefault();
    }
}

const pointX = ref<number>();
const pointY = ref<number>();
const showpoint = ref<boolean>(false);
const rotate = ref<boolean>();
const borderThickness = ref<HTMLInputElement>();
let lockMouseHandler: LockMouse | undefined = undefined;

async function onMouseDown(e: MouseEvent) {
    pointX.value = e.clientX;
    pointY.value = e.clientY;

    if (borderThickness.value && isNaN(Number(borderThickness.value.value))) return;

    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }
    e.stopPropagation();
    lockMouseHandler = new LockMouse(props.context, e);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
    showpoint.value = true;
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        onMouseUp();
    }
}

function onMouseUp() {
    document.exitPointerLock()
    showpoint.value = false
    document.removeEventListener("mousemove", onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp);
    if (lockMouseHandler) {
        lockMouseHandler.fulfil();
        lockMouseHandler = undefined;
    }
    document.removeEventListener("pointerlockchange", pointerLockChange, false);
}

function updatePosition(movementX: number, movementY: number, isRotating: boolean) {
    if (pointX.value === undefined || pointY.value === undefined) return;
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    rotate.value = isRotating;
    pointX.value += movementX;
    pointY.value += movementY;
    pointX.value = pointX.value < 0 ? clientWidth : (pointX.value > clientWidth ? 0 : pointX.value);
    pointY.value = pointY.value < 0 ? clientHeight : (pointY.value > clientHeight ? 0 : pointY.value);
}

function onMouseMove(e: MouseEvent) {
    const isRotating = e.movementX > 0;
    updatePosition(e.movementX, e.movementY, isRotating);
    if (!lockMouseHandler) return;
    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    const strokeInfo = props.manager.fillCtx.strokeInfo!;
    if (borderThickness.value && typeof strokeInfo.sideSetting !== 'string') {
        let thickness = (getSideThickness(strokeInfo.sideSetting) || 0) + e.movementX;
        if (thickness > 300) thickness = 300;

        lockMouseHandler?.modifyBorderThickness(props.manager.flat, thickness < 0 ? 0 : thickness);
    }
}

const line_end_point = (shapes: ShapeView[]) => {
    let segment = false;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape instanceof PathShapeView) {
            if (shape.segments.length === 1 && !shape.segments[0].isClosed) {
                segment = true
                break;
            } else if (shape.segments.length > 1) {
                segment = true
                break;
            }
        }
    }
    return shapes.every(v => (v.type === ShapeType.Line || v.type === ShapeType.Contact || segment));
}
const updater = () => {
    const shapes = props.context.selection.selectedShapes;
    show_apex.value = line_end_point(getShapesForStyle(shapes));
}

function selection_wather(t?: any) {
    if (t === Selection.CHANGE_SHAPE) {
        updater();
    }
}

onMounted(() => {
    updater();
    props.context.selection.watch(selection_wather);
})
onUnmounted(() => {
    props.context.selection.unwatch(selection_wather);
})

</script>

<template>
    <div class="borders-container"
        v-if="manager.fillCtx.strokeInfo && (manager.fillCtx.fills.length || manager.fillCtx.mixed)">
        <div class="bottom">
            <div class="test" style=" flex: calc(50% - 20px);"
                :style="{ pointerEvents: [ShapeType.Table, ShapeType.Line].includes(manager.flat[0].type) ? 'none' : 'auto' }">
                <Select class="select" :context="context" :shapes="manager.flat" :source="positonOptionsSource"
                        :selected="positoSelected()" @select="positionSelect" :index="0"
                        :mixed="manager.fillCtx.strokeInfo.position === 'mixed'"></Select>
            </div>
            <div class="thickness-container" style=" flex: calc(50% - 20px);" :class="{ actived: isActived }">
                <SvgIcon :icon="thickness_icon"
                    :class="{ cursor_pointer: typeof manager.fillCtx.strokeInfo.sideSetting === 'string' }"
                    @mousedown.stop="onMouseDown($event)" />
                <input v-blur ref="borderThickness" type="text" :value="thickness_value()" @change="setThickness($event)"
                    @blur="strokeBlur" @click="strokeClick" @focus="isActived = true;"
                    @keydown="e => keydownThickness(e, thickness_value())">
            </div>
        </div>
        <BorderDetail :context="context" :manager="manager" :trigger="trigger"></BorderDetail>
    </div>
    <Apex v-if="show_apex && (manager.fillCtx.fills.length || manager.fillCtx.mixed)" :context="context"
        :manager="manager" :trigger="trigger"></Apex>
    <teleport to="body">
        <div v-if="showpoint" class="point" :style="{ top: (pointY! - 10.5) + 'px', left: (pointX! - 10) + 'px' }">
        </div>
    </teleport>
</template>

<style scoped lang="scss">
.borders-container {
    display: flex;
    align-items: center;
    gap: 8px;


    .bottom {
        width: calc(100% - 36px);
        display: flex;
        align-items: center;
        height: 32px;
        gap: 8px;

        >.select {
            height: 100%;
            width: 100px;
        }

        .thickness-container {
            box-sizing: border-box;
            padding: 8px 12px;
            background-color: var(--input-background);
            height: 32px;
            border-radius: var(--default-radius);
            border: 1px solid transparent;
            display: flex;
            align-items: center;
            gap: 8px;
            overflow: hidden;

            >img {
                cursor: -webkit-image-set(url("@/assets/cursor/scale.png") 1.5x) 14 14, auto !important;
                width: 14px;
                height: 16px;
            }

            .cursor_pointer {
                cursor: default !important;
            }

            >input {
                width: 100%;
                outline: none;
                border: none;
                padding: 0;
                background-color: transparent;
            }

            input::selection {
                color: #FFFFFF;
                background: #1878F5;
            }

            input::-moz-selection {
                color: #FFFFFF;
                background: #1878F5;
            }
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