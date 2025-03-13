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
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n';
import SvgIcon from "@/components/common/SvgIcon.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { Path, PointEditType } from "@/context/path";
import { get_action_for_key_change, get_value_from_points } from "@/utils/pathedit";
import { AsyncPathEditor, CurveMode, CurvePoint, PathShapeView, PathType, ShapeView } from "@kcdesign/data";
import { Selection } from "@/context/selection";
import MossInput from "@/components/common/MossInput.vue";
import { format_value as format } from '@/utils/common';

interface Props {
    context: Context
}

interface ModelState {
    x: boolean
    y: boolean
    r: boolean
    tool: boolean
}

const props = defineProps<Props>();
const x = ref<number | string>('');
const y = ref<number | string>('');
const r = ref<number | string>('');
const curve_mode = ref<PointEditType>('INVALID');
const model_state: ModelState = reactive({ x: true, y: true, r: true, tool: true });
const t = useI18n().t;
let path_shape: ShapeView | undefined = undefined;
const path_close_status = ref<boolean>(true);
const btn_string_for_status = ref<string>(t('attr.de_close_path'));

const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let asyncPathEditor: AsyncPathEditor | undefined = undefined;

function execute_change_xy(key: 'x' | 'y', val: any) {
    val = Number(val);
    if (!path_shape || isNaN(val)) {
        console.log('!path_shape || isNaN(val)');
        return;
    }
    const editor = props.context.editor4Shape(path_shape);
    const actions = get_action_for_key_change(props.context, val, key);
    if (!actions) {
        console.log('!actions');
        return;
    }
    editor.modifyPointsXY(actions)
}

function onChangeX(_val: any) {
    execute_change_xy('x', _val);
}

function onChangeY(_val: any) {
    execute_change_xy('y', _val);
}

function onChangeR(val: any) {
    val = Number(val);
    if (!path_shape || isNaN(val)) return;
    const selected_points = props.context.path.selectedPoints;
    const editor = props.context.editor4Shape(path_shape);
    editor.modifyPointsCornerRadius(selected_points, val);
}

function onChangeCurveMode(cm: CurveMode) {
    if (!path_shape) return;
    const selected_points = props.context.path.selectedPoints;
    const editor = props.context.editor4Shape(path_shape);
    editor.modifyPointsCurveMode(selected_points, cm);
}


function updatePosition(movementX: number, movementY: number) {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    telX.value += movementX;
    telY.value += movementY;
    telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
    telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}
const dragstart = async (e: MouseEvent) => {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }
    const pathshape = props.context.selection.pathshape;
    if (!pathshape) {
        return;
    }
    asyncPathEditor = props.context.editor
        .controller()
        .asyncPathEditor(pathshape as PathShapeView, props.context.selection.selectedPage!)
    document.addEventListener("pointerlockchange", pointerLockChange, false);
}

function draggingX(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    const selected = props.context.path.syntheticPoints;
    const pathshape = props.context.selection.pathshape;
    if (!pathshape) {
        return;
    }
    if (!selected?.size) {
        return;
    }
    if (!asyncPathEditor) return;
    const keys = Array.from(selected.keys());
    const values = Array.from(selected.values());
    let firstPoint: CurvePoint | undefined = undefined;
    if (pathshape.pathType === PathType.Editable) {
        const __points = (pathshape as PathShapeView)?.segments[keys[0]]?.points;
        if (!__points) return;
        firstPoint = __points[values[0][0]] as CurvePoint;
    }
    if (!firstPoint) return;
    const m = pathshape.matrix2Root();
    m.preScale(pathshape.frame.width, pathshape.frame.height);

    const _firstPoint = m.computeCoord3(firstPoint);
    _firstPoint.x += e.movementX;
    const __firstPointTarget = m.inverseCoord(_firstPoint);
    asyncPathEditor.execute2(selected, __firstPointTarget.x - firstPoint.x, __firstPointTarget.y - firstPoint.y);
}

function draggingY(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    const selected = props.context.path.syntheticPoints;
    const pathshape = props.context.selection.pathshape;
    if (!pathshape) {
        return;
    }
    if (!selected?.size) {
        return;
    }
    if (!asyncPathEditor) return;
    const keys = Array.from(selected.keys());
    const values = Array.from(selected.values());
    let firstPoint: CurvePoint | undefined = undefined;
    if (pathshape.pathType === PathType.Editable) {
        const __points = (pathshape as PathShapeView)?.segments[keys[0]]?.points;
        if (!__points) return;
        firstPoint = __points[values[0][0]] as CurvePoint;
    }
    if (!firstPoint) return;
    const m = pathshape.matrix2Root();
    m.preScale(pathshape.frame.width, pathshape.frame.height);

    const _firstPoint = m.computeCoord3(firstPoint);
    _firstPoint.y += e.movementX;
    const __firstPointTarget = m.inverseCoord(_firstPoint);
    asyncPathEditor.execute2(selected, __firstPointTarget.x - firstPoint.x, __firstPointTarget.y - firstPoint.y);
}

function draggingR(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    const selected = props.context.path.syntheticPoints;

    if (!selected?.size) {
        return;
    }
    if (!asyncPathEditor) return;
    asyncPathEditor.executeRadius(selected, e.movementX);
}

function modifyTelUp() {
    tel.value = false;
    document.exitPointerLock();
    asyncPathEditor?.close();
    asyncPathEditor = undefined;
    document.removeEventListener("pointerlockchange", pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        modifyTelUp();
    }
}

function dragend() {
    modifyTelUp();
}

function exit() {
    props.context.workspace.setPathEditMode(false);
}

function calc() {
    x.value = '';
    y.value = '';
    r.value = '';

    const state = get_value_from_points(props.context, props.context.path.selectedPoints);
    if (!state) {
        return;
    }

    x.value = state.x === 'mix' ? t('attr.more_value') : state.x;
    y.value = state.y === 'mix' ? t('attr.more_value') : state.y;
    r.value = state.r === 'mix' ? t('attr.more_value') : state.r;
}

function modify_path_closed_status() {
    path_close_status.value = true;
    btn_string_for_status.value = t('attr.de_close_path');

    if (!path_shape) {
        console.log('modify_path_closed_status: !path_shape');
        return;
    }

    const segments = (path_shape as PathShapeView)?.segments;
    if (!segments?.length) return;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment.isClosed) {
            path_close_status.value = false;
            btn_string_for_status.value = t('attr.close_path');
            break;
        }
    }
}

function modify_model_state() {
    const selected_points = props.context.path.selectedPoints;
    const selected_sides = props.context.path.selectedSides;
    if (selected_points.size || selected_sides.size) {
        model_state.x = false;
        model_state.y = false;
        model_state.r = false;
        model_state.tool = false;
    } else {
        model_state.x = true;
        model_state.y = true;
        model_state.r = true;
        model_state.tool = true;
    }
}

function get_current_curve_mode() {
    curve_mode.value = 'INVALID';

    const __points = props.context.path.getCurvePoints();
    if (!__points?.length) {
        return;
    }
    if (__points.length === 1) {
        const __point = __points[0];
        if (!__point) {
            return;
        }
        curve_mode.value = __point.mode;
        return;
    }

    const fcm: CurveMode = __points[0].mode;
    if (!fcm) {
        console.log('!fcm');
        return;
    }

    for (let i = 1, _l = __points.length; i < _l; i++) {
        const curve_point = __points[i];

        if (!curve_point) {
            continue;
        }

        if (curve_point.mode !== fcm) {
            return;
        }
    }

    curve_mode.value = fcm;
}

function update() {
    modify_path_closed_status();
    get_current_curve_mode();
    modify_model_state();
    calc();
}

function __update(...args: any) {
    modify_path_closed_status();
    get_current_curve_mode();
    calc();
}

function path_watcher(t: number) {
    if (t === Path.SELECTION_CHANGE) {
        update();
    }
}

function init_path_shape() {
    path_shape = props.context.selection.pathshape;
    if (path_shape) {
        path_shape.watch(__update);
    }
}

function selection_watcher(t: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        const t = props.context.selection.pathshape;
        if (path_shape) {
            path_shape.unwatch(__update);
        }
        if (t) {
            path_shape = t;
            path_shape.watch(__update);
        }
    }
}

onMounted(() => {
    props.context.path.watch(path_watcher);
    props.context.selection.watch(selection_watcher);
    init_path_shape();
    update();
})
onUnmounted(() => {
    props.context.path.unwatch(path_watcher);
    props.context.selection.unwatch(selection_watcher);
    if (path_shape) {
        path_shape.unwatch(__update);
    }
})

import x_icon from "@/assets/icons/svg/X.svg";
import y_icon from "@/assets/icons/svg/Y.svg";
import radius_icon from "@/assets/icons/svg/radius.svg";
import straight_icon from "@/assets/icons/svg/straight.svg";
import mirrored_icon from "@/assets/icons/svg/mirrored.svg";
import asymmetric_icon from "@/assets/icons/svg/asymmetric.svg";
import disconnected_icon from "@/assets/icons/svg/disconnected.svg";

</script>
<template>
    <div class="table">
        <div class="tr">
            <MossInput :icon="x_icon" :draggable="true" :value="format(x)" :disabled="model_state.x" @change="onChangeX"
                @dragstart="dragstart" @dragging="draggingX" @dragend="dragend">
            </MossInput>
            <MossInput :icon="y_icon" :draggable="true" :value="format(y)" :disabled="model_state.y" @change="onChangeY"
                @dragstart="dragstart" @dragging="draggingY" @dragend="dragend">
            </MossInput>
            <div style="width: 32px;height: 32px;"></div>
        </div>
        <div class="tr">
            <MossInput :icon="radius_icon" :draggable="true" :value="format(r)" :disabled="model_state.r" @change="onChangeR"
                @dragstart="dragstart" @dragging="draggingR" @dragend="dragend">
            </MossInput>
        </div>
        <div class="tr">
            <div :class="{ tool: true, tool_disabled: model_state.tool }">
                <Tooltip :content="t('attr.right_angle')">
                    <div @mousedown.stop="() => onChangeCurveMode(CurveMode.Straight)"
                        :class="{ item: true, active: curve_mode === CurveMode.Straight }">
                        <SvgIcon :icon="straight_icon"/>
                    </div>
                </Tooltip>
                <Tooltip :content="t('attr.completely_symmetrical')">
                    <div @mousedown.stop="() => onChangeCurveMode(CurveMode.Mirrored)"
                        :class="{ item: true, active: curve_mode === CurveMode.Mirrored }">
                        <SvgIcon :icon="mirrored_icon"/>
                    </div>
                </Tooltip>
                <Tooltip :content="t('attr.asymmetric')">
                    <div @mousedown.stop="() => onChangeCurveMode(CurveMode.Asymmetric)"
                        :class="{ item: true, active: curve_mode === CurveMode.Asymmetric }">
                        <SvgIcon :icon="asymmetric_icon"/>
                    </div>
                </Tooltip>
                <Tooltip :content="t('attr.angular_symmetry')">
                    <div @mousedown.stop="() => onChangeCurveMode(CurveMode.Disconnected)"
                        :class="{ item: true, active: curve_mode === CurveMode.Disconnected }">
                        <SvgIcon :icon="disconnected_icon"/>
                    </div>
                </Tooltip>
            </div>
        </div>
        <div class="btns">
            <div class="exit" @click="exit">
                {{ t('attr.exit_path_edit') }}
            </div>
        </div>
    </div>
    <teleport to="body">
        <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
        </div>
    </teleport>
</template>
<style scoped lang="scss">
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    visibility: visible;
    border-bottom: 1px solid #F0F0F0;

    .tr {
        position: relative;
        width: 100%;
        height: 32px;
        align-items: center;
        justify-content: space-between;
        display: flex;
        flex-direction: row;
        margin-bottom: 8px;

        .position {
            width: 88px;
            height: 32px;
            border-radius: var(--default-radius);
        }

        .space {
            width: 18px;
        }

        >.icontext {
            background-color: rgba(#D8D8D8, 0.4);
        }


        .frame {
            width: 95px;
            height: 30px;
            border-radius: var(--default-radius);
        }

        .tool {
            height: 100%;
            border-radius: var(--default-radius);
            background-color: var(--input-background);
            display: flex;
            align-content: space-around;
            align-items: center;
            box-sizing: border-box;
            position: relative;
            transition: 0.3s;
            padding: 2px;


            .item {
                height: 100%;
                width: 28px;
                border-radius: 4px;
                display: flex;
                justify-content: center;
                align-items: center;

                >svg {
                    height: 16px;
                    width: 16px;
                }
            }

            .item:hover {
                background-color: rgba(235, 235, 235);
            }

            .active {
                background-color: #ffffff !important;
            }
        }

        .tool_disabled {
            opacity: 0.5;
            pointer-events: none;
        }
    }

    .btns {
        position: relative;
        width: 100%;
        height: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .path-status {
            width: 108px;
            height: 100%;
            background-color: #ffffff;
            color: var(--theme-color);
            text-align: center;
            line-height: 32px;
            cursor: pointer;
            border: 1px solid #f0f0f0;
            border-radius: var(--default-radius);
        }

        .disabled {
            opacity: 0.5;
            pointer-events: none;
        }

        .exit {
            width: 100%;
            height: 100%;
            background-color: var(--active-color);
            color: var(--theme-color-anti);
            text-align: center;
            line-height: 32px;
            cursor: pointer;
            border-radius: var(--default-radius);

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