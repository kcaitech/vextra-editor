/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

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
import { onMounted, ref, reactive, onUnmounted } from 'vue'
import { ArtboardView, ShapeType, ShapeView, TextBehaviour, TextShapeView, TidyUpAlign } from '@kcdesign/data';
import { debounce, throttle } from 'lodash';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import Tooltip from '@/components/common/Tooltip.vue';
import Radius from './Radius/Index.vue';
import {
    get_actions_constrainer_proportions,
    get_actions_frame_x, get_actions_frame_y,
    is_straight,
    get_xy,
    get_width,
    get_height,
    get_constrainer_proportions,
    get_shapes_rotation,
    get_shapes_angle_counts,
    get_actions_counts,
    showCounts,
    showInnerAngle,
    get_shapes_inner_angle,
    get_actions_inner_angle, showOvalOptions
} from '@/utils/attri_setting';
import { watch } from 'vue';
import { format_value as format } from '@/utils/common';
import CommonInput from "@/components/common/CommonInput.vue";
import { LockMouse } from "@/transform/lockMouse";
import { computeString } from "@/utils/content";
import { Attribute } from '@/context/atrribute';
import { flip } from "@/transform/flip";
import { Tool } from "@/context/tool";
import { rotate as __rotate } from "@/transform/rotate"
import Oval from "@/components/Document/Attribute/BaseAttr/Oval.vue";
import {
    checkTidyUpShapesOrder,
    getSelectedWidthHeight,
    getVisibleShapes,
    hiddenTidyUp,
    layoutSpacing,
    tidyUpShapesOrder,
    whetherNeedTidyUp
} from '@/utils/tidy_up';
import { WorkSpace } from '@/context/workspace';
import { LinearApi } from "@kcdesign/data"
import { sortValue } from "@/components/Document/Attribute/BaseAttr/oval";
import ContentClip from "@/components/Document/Attribute/BaseAttr/ContentClip.vue";
import x_icon from "@/assets/icons/svg/X.svg";
import y_icon from "@/assets/icons/svg/Y.svg";
import w_icon from "@/assets/icons/svg/W.svg";
import h_icon from "@/assets/icons/svg/H.svg";
import angle_icon from "@/assets/icons/svg/angle.svg";
import angle_count_icon from "@/assets/icons/svg/angle-count.svg";
import inner_angle_icon from "@/assets/icons/svg/inner-angle.svg";
import hor_space2_icon from "@/assets/icons/svg/hor-space2.svg";
import ver_space2_icon from "@/assets/icons/svg/ver-space2.svg";
import SvgIcon from '@/components/common/SvgIcon.vue';
import adapt_icon from "@/assets/icons/svg/adapt.svg";
import lock_icon from "@/assets/icons/svg/lock.svg";
import lock_open_icon from "@/assets/icons/svg/lock-open.svg";
import fliph_icon from "@/assets/icons/svg/fliph.svg";
import flipv_icon from "@/assets/icons/svg/flipv.svg";
import tidy_up_icon from "@/assets/icons/svg/tidy-up.svg";

type Props = {
    context: Context;
    selectionChange: number;
    trigger: any[];
    shapes: ShapeView[];
}

type ModelState = {
    x: boolean
    y: boolean
    width: boolean
    height: boolean
    rotation: boolean
    flipHorizontal: boolean
    flipVertical: boolean
    radius: boolean
    counts: boolean
    innerAngle: boolean
    ovalOptions: boolean
    clip: boolean
}

const props = defineProps<Props>();
const { t } = useI18n();
const x = ref<number | string>(0);
const y = ref<number | string>(0);
const w = ref<number | string>(0);
const h = ref<number | string>(0);
const rotate = ref<number | string>(0);
const counts = ref<number | string>(0);
const innerAngle = ref<number | string>(0);
const isLock = ref<boolean>(false);
const fix = 2;
const mixed = t('attr.mixed');
const horTidyUp = ref(true);
const verTidyUp = ref(true);
const horSpace = ref<number | string>('');
const verSpace = ref<number | string>('');
const s_tidy_up = ref(false);
const attr_state = reactive({
    s_flip: true,
    s_radius: false,
    s_adapt: false,
    s_counts: false,
    s_inner_angle: false,
    s_oval: false,
    s_clip: false,
    s_length: false
});
const model_disable_state: ModelState = reactive({
    x: false,
    y: false,
    width: false,
    height: false,
    rotation: false,
    flipHorizontal: false,
    flipVertical: false,
    radius: false,
    counts: false,
    innerAngle: false,
    ovalOptions: false,
    clip: false,
});
const linearApi = new LinearApi(props.context.repo, props.context.data, props.context.selection.selectedPage!)

function _calc_attri() {
    const selected = props.shapes;
    if (!selected.length) return;
    const xy = get_xy(selected, mixed);
    x.value = xy.x;
    y.value = xy.y;
    w.value = get_width(selected, mixed);
    h.value = get_height(selected, mixed);
    isLock.value = get_constrainer_proportions(selected);
    rotate.value = get_shapes_rotation(selected, mixed);
    counts.value = get_shapes_angle_counts(selected, mixed);
    innerAngle.value = get_shapes_inner_angle(selected, mixed);
}

const calc_attri = throttle(_calc_attri, 60, { trailing: true });

const parentSymbolRef = () => {
    const len = props.shapes.length;
    let is_dis = false;
    if (len === 1) {
        const shape = props.shapes[0];
        let p = shape.parent;
        while (p && p.type !== ShapeType.Page) {
            if (p.type === ShapeType.SymbolRef) {
                is_dis = true;
            }
            p = p.parent;
        }
    } else if (len > 1) {
        const shapes = props.shapes;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            let p = shape.parent;
            while (p && p.type !== ShapeType.Page) {
                if (p.type === ShapeType.SymbolRef) {
                    is_dis = true;
                    break;
                }
                p = p.parent;
            }
        }
    }
    return is_dis;
}

function _update_view() {
    if (props.shapes.length) {
        layout();
        check_model_state();
    }

    if (parentSymbolRef()) {
        all_disable();
    } else {
        check_model_state();
    }
    autoLayoutDisable();
}

const update_view = debounce(_update_view, 200, { leading: true });

function changeX(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _x: number = Number.parseFloat(value);
    if (isNaN(_x)) return;

    const shapes = props.shapes;


    const actions = get_actions_frame_x(shapes, _x);

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    editor.modifyShapesX(actions);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function keydownX(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = props.shapes;
        const actions = get_actions_frame_x(shapes, value);
        linearApi.modifyShapesX(actions)
        event.preventDefault();
    }
}

function changeY(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _y: number = Number.parseFloat(value);
    if (isNaN(_y)) return;

    const shapes = props.shapes;

    const actions = get_actions_frame_y(shapes, _y);
    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    editor.modifyShapesY(actions);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function keydownY(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = props.shapes;
        const actions = get_actions_frame_y(shapes, value);
        linearApi.modifyShapesY(actions)
        event.preventDefault();
    }
}

function changeW(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _w: number = Number.parseFloat(value);
    if (isNaN(_w)) return;

    const shapes = props.shapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesWidth(shapes, _w);
    props.context.attr.notify(Attribute.FRAME_CHANGE);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function keydownW(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = props.shapes;
        linearApi.modifyShapesWidth(shapes, value)
        event.preventDefault();
    }
}

function changeH(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const _h: number = Number.parseFloat(value);
    if (isNaN(_h)) {
        return;
    }

    const shapes = props.shapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    editor.modifyShapesHeight(shapes, _h);
    props.context.attr.notify(Attribute.FRAME_CHANGE);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function keydownH(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = props.shapes;
        linearApi.modifyShapesHeight(shapes, value)
        event.preventDefault();
    }
}

function lockToggle() {
    if (attr_state.s_length) {
        return;
    }

    const val = !isLock.value;
    const actions = get_actions_constrainer_proportions(props.shapes, val);
    const page = props.context.selection.selectedPage;
    if (!page) {
        return;
    }

    const editor = props.context.editor4Page(page);
    editor.setShapesConstrainerProportions(actions);
}

function fliph() {
    if (model_disable_state.flipHorizontal) {
        return;
    }
    flip(props.context, 'Y');
}

function flipv() {
    if (model_disable_state.flipVertical) {
        return;
    }
    flip(props.context, 'X');
}

function changeR(value: string) {
    value = value.replace('°', '');

    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const newRotate: number = Number.parseFloat(value);

    if (isNaN(newRotate)) return;

    const shapes = props.shapes;
    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    const transforms = __rotate(shapes, newRotate);

    editor.setShapesRotate(transforms);

    props.context.nextTick(props.context.selection.selectedPage!, () => {
        props.context.tool.notify(Tool.RULE_RENDER_SIM);
    });
}

function keydownR(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = props.shapes;
        const transforms = __rotate(shapes, value)
        linearApi.setShapesRotate(transforms)
        event.preventDefault();
    }
}

function changeCounts(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    let count = Number.parseFloat(value);
    if (isNaN(count) || count == counts.value) {
        return;
    }
    if (count < 3) count = 3;
    if (count > 60) count = 60;
    const shapes = props.shapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    const actions = get_actions_counts(shapes, count);

    editor.modifyShapesAngleCount(actions);
}

function changeInnerAngle(value: string) {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    let offset: number = Number.parseFloat(value);
    if (isNaN(offset) || offset == innerAngle.value) {
        return;
    }
    if (offset < 0.1) offset = 0.1;
    if (offset > 100) offset = 100;

    const shapes = props.shapes;

    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    const actions = get_actions_inner_angle(shapes, offset / 100);

    editor.modifyShapesInnerAngle(actions);
}

function adapt() {
    props.context
        .editor4Shape((props.shapes[0]))
        .adapt();
}

function layout() {
    reset_layout();
    const selected = props.shapes;
    if (selected.length === 1) {
        const shape = selected[0];
        attr_state.s_radius = !!shape.radiusType;
        attr_state.s_adapt = shape.type === ShapeType.Artboard;
        if (shape.type === ShapeType.Cutout) attr_state.s_flip = false;
        if (is_straight(shape) || shape.type === ShapeType.Contact) attr_state.s_length = true;
    } else if (selected.length > 1) {
        attr_state.s_radius = selected.some(item => !!item.radiusType);
    }

    if (parentSymbolRef()) attr_state.s_length = true;
    
    attr_state.s_counts = showCounts(selected);
    attr_state.s_inner_angle = showInnerAngle(selected);
    attr_state.s_oval = showOvalOptions(selected);
    attr_state.s_clip = selected.some(i => !i.isVirtualShape && (i.type === ShapeType.Artboard || i.type === ShapeType.Symbol || i.type === ShapeType.SymbolRef));
}

function reset_layout() {
    attr_state.s_adapt = false;
    attr_state.s_flip = true;
    attr_state.s_radius = false;
    attr_state.s_length = false;
    attr_state.s_counts = false;
    attr_state.s_inner_angle = false;
    attr_state.s_oval = false;
}

function check_model_state() {
    reset_model_state();
    const shapes = props.shapes;
    if (shapes.length !== 1) return;
    const shape = shapes[0];

    if (shape.type === ShapeType.Contact) {
        model_disable_state.x = true;
        model_disable_state.y = true;
        model_disable_state.width = true;
        model_disable_state.height = true;
        model_disable_state.rotation = true;
        model_disable_state.flipVertical = true;
        model_disable_state.flipHorizontal = true;
        model_disable_state.radius = false;
        model_disable_state.counts = false;
        model_disable_state.innerAngle = false;
    }

    if (is_straight(shape)) {
        model_disable_state.height = true;
    }
}

function reset_model_state() {
    model_disable_state.x = false;
    model_disable_state.y = false;
    model_disable_state.width = false;
    model_disable_state.height = false;
    model_disable_state.rotation = false;
    model_disable_state.flipVertical = false;
    model_disable_state.flipHorizontal = false;
    model_disable_state.radius = false;
    model_disable_state.counts = false;
    model_disable_state.innerAngle = false;
    model_disable_state.ovalOptions = false;
}

function all_disable() {
    model_disable_state.x = true;
    model_disable_state.y = true;
    model_disable_state.width = true;
    model_disable_state.height = true;
    model_disable_state.rotation = true;
    model_disable_state.flipVertical = true;
    model_disable_state.flipHorizontal = true;
    model_disable_state.radius = true;
    model_disable_state.counts = true;
    model_disable_state.innerAngle = true;
    model_disable_state.ovalOptions = true;
}

const autoLayoutDisable = () => {
    const shapes = props.shapes;
    const every = shapes.every(item => item.parent && (item.parent as ArtboardView).autoLayout);
    if (every) {
        model_disable_state.x = true, model_disable_state.y = true;
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

let orderShapes: ShapeView[][] = [];
let minHor = 0;
let minVer = 0;
async function modifyTelDown(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }
    const selected = props.shapes;
    const d = props.context.selection.isTidyUpDir;
    orderShapes = checkTidyUpShapesOrder(selected, d);
    minVer = Math.min(...selected.map(s => s.relativeFrame.height - 1));
    minHor = Math.min(...selected.map(s => s.relativeFrame.width - 1));
    lockMouseHandler = new LockMouse(props.context, e);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
}

function modifyTelUp() {
    tel.value = false;
    document.exitPointerLock();

    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
    document.removeEventListener("pointerlockchange", pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) {
        modifyTelUp();
    }
}

function dragstart(e: MouseEvent) {
    modifyTelDown(e);
}

function draggingX(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    lockMouseHandler.executeX(e.movementX);
}

function draggingY(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    lockMouseHandler.executeY(e.movementX);
}

function draggingW(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeW(e.movementX);
}

function draggingH(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('scaling');
    }

    lockMouseHandler.executeH(e.movementX);
}

function draggingRotate(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('rotating');
    }
    lockMouseHandler.executeRotate(e.movementX);
}

function draggingCounts(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (isNaN(Number(counts.value)) || e.movementX === 0) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('rotating');
    }
    let count = Number(counts.value) + e.movementX;
    if (count < 3) count = 3;
    if (count > 60) count = 60;
    lockMouseHandler.executeCounts(count);
}

function draggingInnerAngle(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (isNaN(Number(innerAngle.value)) || e.movementX === 0) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('rotating');
    }

    lockMouseHandler.executeInnerAngle(e.movementX / 1000);
}

function draggingTidyUp(e: MouseEvent, dir: 'hor' | 'ver') {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    const d = props.context.selection.isTidyUpDir;
    const frame = layoutSpacing(orderShapes, d);

    let hor = frame.hor;
    let ver = frame.ver;
    if (dir === 'hor') {
        hor += e.movementX;
        horSpace.value = Math.max(hor, -minHor);
    } else {
        ver += e.movementX;
        verSpace.value = Math.max(ver, -minVer);
    }

    disableTidyUp(orderShapes, d);
    const align = props.context.selection.tidyUpAlign;
    lockMouseHandler.executeTidyup(orderShapes, Math.max(hor, -minHor), Math.max(ver, -minVer), d, align);
}

function dragend() {
    modifyTelUp();
}

function dragend2() {
    modifyTelUp();
    props.context.attr.notify(Attribute.FRAME_CHANGE);
}

function formatRotate(rotate: number | string) {
    return rotate + `${rotate === mixed ? '' : '°'}`;
}

const tidyUp = () => {
    if (!props.context.selection.isTidyUp) return;
    const selected = getVisibleShapes(props.shapes);
    const { width, height } = getSelectedWidthHeight(props.context, selected);

    const shapes = tidyUpShapesOrder(selected, height > width);
    const frame = layoutSpacing(shapes, height > width);
    horSpace.value = frame.hor;
    verSpace.value = frame.ver;
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.tidyUpShapesLayout(shapes, frame.hor, frame.ver, height > width, 'center');
}

const changeHorTidyUp = (value: string) => {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const hor: number = Number.parseFloat(value);
    if (isNaN(hor)) return;
    const selected = getVisibleShapes(props.shapes);
    const dir = props.context.selection.isTidyUpDir;
    const shapes = checkTidyUpShapesOrder(selected, dir);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    disableTidyUp(shapes, dir);
    const minHor = Math.min(...selected.map(s => s.relativeFrame.width - 1));
    horSpace.value = Math.max(hor, -minHor);
    const align = props.context.selection.tidyUpAlign;
    editor.tidyUpShapesLayout(shapes, Math.max(hor, -minHor), typeof verSpace.value === 'number' ? verSpace.value : 0, dir, align);
}

function keydownHorTidyUp(e: KeyboardEvent) {
    let hor: any = sortValue(horSpace.value.toString());
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        hor = hor + (e.code === 'ArrowUp' ? 1 : -1)
        if (isNaN(hor)) return;
        const selected = props.shapes;
        const dir = props.context.selection.isTidyUpDir;
        const shapes = checkTidyUpShapesOrder(selected, dir);
        const ver = typeof verSpace.value === 'number' ? verSpace.value : 0
        disableTidyUp(shapes, dir);
        const minHor = Math.min(...selected.map(s => s.relativeFrame.width - 1));
        horSpace.value = Math.max(hor, -minHor);
        const align = props.context.selection.tidyUpAlign;
        linearApi.tidyUpShapesLayout(shapes, horSpace.value, ver, dir, align)
        e.preventDefault();
    }

}

const changeVerTidyUp = (value: string) => {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(fix);

    const ver: number = Number.parseFloat(value);
    if (isNaN(ver)) return;
    const selected = getVisibleShapes(props.shapes);
    const dir = props.context.selection.isTidyUpDir;
    const shapes = checkTidyUpShapesOrder(selected, dir);
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    const hor = typeof horSpace.value === 'number' ? horSpace.value : 0;
    disableTidyUp(shapes, dir);
    const minVer = Math.min(...selected.map(s => s.relativeFrame.height - 1));
    verSpace.value = Math.max(ver, -minVer);
    editor.tidyUpShapesLayout(shapes, hor, Math.max(ver, -minVer), dir, props.context.selection.tidyUpAlign);
}

function keydownVerTidyUp(e: KeyboardEvent) {
    let ver: any = sortValue(verSpace.value.toString());
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        ver = ver + (e.code === 'ArrowUp' ? 1 : -1)
        if (isNaN(ver)) return;
        const selected = props.shapes;
        const dir = props.context.selection.isTidyUpDir;
        const shapes = checkTidyUpShapesOrder(selected, dir);
        const hor = typeof horSpace.value === 'number' ? horSpace.value : 0;
        disableTidyUp(shapes, dir);
        const minVer = Math.min(...selected.map(s => s.relativeFrame.height - 1));
        verSpace.value = Math.max(ver, -minVer);
        linearApi.tidyUpShapesLayout(shapes, hor, verSpace.value, dir, props.context.selection.tidyUpAlign);
        e.preventDefault();
    }

}

function selection_change() {
    update_view();
    calc_attri();
    textBehaviour();
    const selected = getVisibleShapes(props.shapes);
    if (selected.length > 1 && !hiddenTidyUp(selected)) {
        s_tidy_up.value = true;
        whetherTidyUp();
    } else {
        s_tidy_up.value = false;
        props.context.selection.whetherTidyUp(true, false, 'center');
    }
}

const _whetherTidyUp = () => {
    if (props.context.workspace.tidyUpIsTrans) return;
    const selected = getVisibleShapes(props.shapes);
    s_tidy_up.value = false;
    const length = selected.filter(shape => shape.isVisible).length;
    if (length <= 1 || length > 100) return;
    s_tidy_up.value = true;
    if (props.context.workspace.isTranslating || props.context.workspace.isScaling || props.context.workspace.isRotating) return;
    const Info = whetherNeedTidyUp(props.context);
    if (!Info) {
        props.context.selection.whetherTidyUp(true, false, 'center');
        return;
    }
    const { tidyup, hor, ver, shapes, dir } = Info;
    if (!tidyup) {
        horSpace.value = hor;
        verSpace.value = ver;
    } else {
        horSpace.value = '';
        verSpace.value = '';
    }
    verTidyUp.value = tidyup;
    horTidyUp.value = tidyup;
    disableTidyUp(shapes, dir);
    props.context.selection.whetherTidyUp(tidyup, dir, Info.align as TidyUpAlign);
}

const disableTidyUp = (shapes: ShapeView[][], d: boolean) => {
    if (d) {
        if (shapes.length === 1) {
            horTidyUp.value = true;
            horSpace.value = '';
        } else {
            const v = shapes.every(s => s.length === 1);
            if (v) {
                verTidyUp.value = true;
                verSpace.value = '';
            }
        }
    } else {
        if (shapes.length === 1) {
            verTidyUp.value = true;
            verSpace.value = '';
        } else {
            const v = shapes.every(s => s.length === 1);
            if (v) {
                horTidyUp.value = true;
                horSpace.value = '';
            }
        }
    }
}

const whetherTidyUp = debounce(_whetherTidyUp, 250);

const attr_watcher = (t: number, params: any) => {
    if (t === Attribute.HOR_HILP) {
        fliph();
    } else if (t === Attribute.VER_HILP) {
        flipv();
    } else if (t === Attribute.TIDY_UP_SPACE_CHANGE) {
        if (typeof horSpace.value === 'number') {
            horSpace.value = params.hor;
        }
        if (typeof verSpace.value === 'number') {
            verSpace.value = params.ver;
        }
    }
}

const textBehaviour = () => {
    const shapes = props.shapes;
    const all_text = shapes.every(item => item instanceof TextShapeView);
    if (all_text) {
        model_disable_state.width = false;
        model_disable_state.height = false;
        const fixwh = shapes.some(item => (item as TextShapeView).text.attr?.textBehaviour === TextBehaviour.FixWidthAndHeight);
        if (fixwh) return;
        const fixw = shapes.some(item => (item as TextShapeView).text.attr?.textBehaviour === TextBehaviour.Fixed);
        if (fixw) {
            model_disable_state.height = true;
            return;
        }
        model_disable_state.width = true;
        model_disable_state.height = true;
    }
}

const workspace_watcher = (t: string | number) => {
    if (t === WorkSpace.SCALING || t === WorkSpace.ROTATING) {
        whetherTidyUp();
    }
}

const oval_radius_update = () => {
    const selected = props.shapes;
    if (selected.length === 1) {
        const shape = selected[0];
        attr_state.s_radius = !!shape.radiusType;
    } else if (selected.length > 1) {
        attr_state.s_radius = selected.some(item => !!item.radiusType);
    }
}

const stop1 = watch(() => props.selectionChange, selection_change);
const stop3 = watch(() => props.trigger, v => {
    if (v.includes('layout')) {
        calc_attri();
        whetherTidyUp();
    }
    if (v.includes('textBehaviour')) {
        textBehaviour();
    }
    if (v.includes('endingAngle') || v.includes('startingAngle') || v.includes('innerRadius')) {
        oval_radius_update();
    }
});

onMounted(() => {
    selection_change();
    props.context.attr.watch(attr_watcher);
    props.context.workspace.watch(workspace_watcher);
});
onUnmounted(() => {
    props.context.attr.unwatch(attr_watcher);
    props.context.workspace.unwatch(workspace_watcher);
    stop1();
    stop3();
})
</script>
<template>
    <div class="table">
        <div class="tr">
            <CommonInput :icon="x_icon" draggable :value="format(x)" :disabled="model_disable_state.x" @change="changeX"
                @dragstart="dragstart" @dragging="draggingX" @dragend="dragend" @keydown="keydownX" />
            <CommonInput :icon="y_icon" draggable :value="format(y)" @change="changeY" :disabled="model_disable_state.y"
                @dragstart="dragstart" @dragging="draggingY" @dragend="dragend" @keydown="keydownY" />
            <div v-if="attr_state.s_adapt" class="adapt" @click="adapt">
                <Tooltip :content="t('attr.adapt')">
                    <SvgIcon :icon="adapt_icon" style="outline: none;" />
                </Tooltip>
            </div>
            <div v-else style="width: 28px;height: 28px;" />
        </div>
        <div class="tr">
            <CommonInput :icon="w_icon" draggable :value="format(w)" @change="changeW"
                :disabled="model_disable_state.width" @dragstart="dragstart" @dragging="draggingW" @dragend="dragend2"
                @keydown="keydownW" />
            <CommonInput :icon="h_icon" draggable :value="format(h)" @change="changeH"
                :disabled="model_disable_state.height" @dragstart="dragstart" @dragging="draggingH" @dragend="dragend2"
                @keydown="keydownH" />
            <Tooltip :content="t('attr.constrainProportions')">
                <div class="lock" @click="lockToggle" :class="{ 'active': isLock, 'disabled': attr_state.s_length }">
                    <SvgIcon :icon="(isLock && !attr_state.s_length) ? lock_icon : lock_open_icon" :class="{ 'active': isLock }" />
                </div>
            </Tooltip>
        </div>
        <div class="tr">
            <CommonInput :icon="angle_icon" draggable :value="formatRotate(rotate)" @change="changeR"
                :disabled="model_disable_state.rotation" @dragstart="dragstart" @dragging="draggingRotate"
                @dragend="dragend" @keydown="keydownR" />
            <div class="flip-wrapper">
                <Tooltip v-if="attr_state.s_flip" :content="`${t('attr.flip_h')}\u00a0\u00a0Shift H`" :offset="15">
                    <div :class="{ flip: !model_disable_state.flipVertical, 'flip-disable': model_disable_state.flipVertical }"
                        @click="fliph">
                        <SvgIcon :icon="fliph_icon" />
                    </div>
                </Tooltip>
                <Tooltip v-if="attr_state.s_flip" :content="`${t('attr.flip_v')}\u00a0\u00a0Shift V`" :offset="15">
                    <div :class="{ flip: !model_disable_state.flipVertical, 'flip-disable': model_disable_state.flipVertical }"
                        @click="flipv">
                        <SvgIcon :icon="flipv_icon" />
                    </div>
                </Tooltip>
            </div>
            <div style="width: 28px;height: 28px;" />
        </div>
        <div class="tr" v-if="attr_state.s_counts">
            <CommonInput :icon="angle_count_icon" draggable :value="format(counts)" @change="changeCounts"
                :disabled="model_disable_state.counts" @dragstart="dragstart" @dragging="draggingCounts"
                @dragend="dragend" />
            <CommonInput v-if="attr_state.s_inner_angle" :icon="inner_angle_icon" draggable
                :value="innerAngle === mixed ? mixed : format(innerAngle) + '%'" @change="changeInnerAngle"
                :disabled="model_disable_state.counts" @dragstart="dragstart" @dragging="draggingInnerAngle"
                @dragend="dragend" />
            <div style="width:28px;height: 28px;" />
        </div>
        <Radius v-if="attr_state.s_radius" :context="context" :disabled="model_disable_state.radius"
            :selectionChange="selectionChange" :trigger="trigger" />
        <ContentClip v-if="attr_state.s_clip" :context="context" :trigger="trigger" :selection-change="selectionChange" />
        <Oval v-if="attr_state.s_oval" :context="context" :trigger="trigger" :selection-change="selectionChange" />
        <div class="tr" v-if="s_tidy_up">
            <CommonInput :icon="hor_space2_icon" :value="format(horSpace)" :draggable="!horTidyUp"
                @change="changeHorTidyUp" :disabled="horTidyUp" @dragstart="dragstart"
                @dragging="(e) => draggingTidyUp(e, 'hor')" @dragend="dragend" @keydown="keydownHorTidyUp" />
            <CommonInput :icon="ver_space2_icon" :value="format(verSpace)" :draggable="!verTidyUp"
                @change="changeVerTidyUp" :disabled="verTidyUp" @dragstart="dragstart"
                @dragging="(e) => draggingTidyUp(e, 'ver')" @dragend="dragend" @keydown="keydownVerTidyUp" />
            <div class="adapt" @click="tidyUp" :style="{ opacity: !verTidyUp || !horTidyUp ? 0.4 : 1 }"
                :class="{ 'tidy-up-disable': !verTidyUp || !horTidyUp }">
                <Tooltip :content="t('attr.tidy_up')">
                    <SvgIcon :icon="tidy_up_icon" style="outline: none;" />
                </Tooltip>
            </div>
        </div>
    </div>
    <teleport to="body">
        <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
        </div>
    </teleport>
</template>
<style scoped lang="scss">
.ml-24 {
    margin-left: 18px;
}

.table {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 8px 12px 8px;
    box-sizing: border-box;
    visibility: visible;
    border-bottom: 1px solid #F0F0F0;

    .tr {
        position: relative;
        width: 100%;
        height: 30px;
        align-items: center;
        justify-content: space-between;
        display: flex;
        flex-direction: row;
        gap: 8px;

        >.icontext {
            background-color: var(--input-background);
        }

        .frame {
            width: 88px;
            height: 32px;
            margin: 0 0;
            border-radius: var(--default-radius);
        }

        .lock {
            height: 28px;
            width: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            box-sizing: border-box;
            border: 1px solid #F0F0F0;
            padding: 9px;

            >img {
                color: #808080;
                width: 13px;
                height: 13px;
            }

            >img.active {
                color: #FFFFFF;
            }
        }

        .lock:hover {
            background: #F4F5F5;
        }

        .lock.active {
            background-color: #1878F5;
            border: 1px solid #1878F5;
        }

        .adapt {
            width: 28px;
            height: 28px;
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
                width: 13px;
                height: 13px;
                color: #808080;
            }
        }

        .adapt:hover {
            background: #F4F5F5;
        }

        .angle {
            width: 88px;
            height: 32px;
            border-radius: var(--default-radius);

            >img {
                width: 12px;
                height: 12px;
            }
        }

        .flip-wrapper {
            width: 88px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;

            .flip {
                background-color: var(--input-background);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 32px;
                border-radius: var(--default-radius);
                padding: 9px 14px;
                box-sizing: border-box;

                >img {
                    color: var(--coco-grey);
                    width: 12px;
                    height: 14px;
                }
            }

            .flip:hover {
                background-color: #EBEBEB;
            }

            .flip-disable {
                opacity: 0.4;
                background-color: var(--input-background);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 40px;
                height: 32px;
                border-radius: var(--default-radius);

                >img {
                    color: var(--coco-grey);
                    width: 40%;
                    height: 40%;
                }
            }
        }

        .active {
            background-color: var(--active-color);
            color: #fff;
        }

        .more-for-radius {
            width: 28px;
            height: 28px;
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
            background-color: #1878F5;
            border: 1px solid #1878F5;
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

.tidy-up-disable {
    pointer-events: none;
}

.disabled {
    pointer-events: none;
    opacity: 0.4;

    &:hover {
        background: #F4F5F5 !important;
    }
}
</style>