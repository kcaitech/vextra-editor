<script setup lang="ts">
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import {
    CutoutShapeView, PathShapeView, RadiusType,
    ShapeType, ShapeView, SymbolView, TableView, TextShapeView
} from '@kcdesign/data';
import { get_indexes2 } from '@/utils/attri_setting';
import { hidden_selection } from "@/utils/content";
import MossInput from "@/components/common/MossInput.vue";
import { LockMouse } from "@/transform/lockMouse";
import Tooltip from "@/components/common/Tooltip.vue";
import { useI18n } from "vue-i18n";
import { fixedZero } from '@/utils/common';
import { sortValue } from "@/components/Document/Attribute/BaseAttr/oval";
import { LinearApi } from "@kcdesign/data"

const { t } = useI18n();

interface Props {
    context: Context
    disabled: boolean
    linearApi: LinearApi
}

const props = defineProps<Props>();
const rect = ref<boolean>(localStorage.getItem('radius-corner-display') === "all");
const can_be_rect = ref<boolean>(false);
const radius = reactive<{ lt: number | string, rt: number | string, rb: number | string, lb: number | string }>({
    lt: 0,
    rt: 0,
    rb: 0,
    lb: 0
});
const mixed = props.context.workspace.t('attr.mixed');
const keyupdate = ref<boolean>(false)

function get_value_from_input(val: any) {
    let value = Number.parseFloat(val);
    value = (value > 0 && !isNaN(value)) ? value : 0;
    if (!(value % 1)) return value;
    if (!(value % 0.1)) return Number(value.toFixed(1));
    else return Number(value.toFixed(2));
}

function noGroupShapesFrom(shapes: ShapeView[]) {
    const result: ShapeView[] = [];
    for (const shape of shapes) {
        if (shape instanceof TableView || shape instanceof TextShapeView || shape instanceof CutoutShapeView) continue;
        if (shape.type === ShapeType.Group) {
            result.push(...noGroupShapesFrom(shape.childs));
            continue;
        }
        result.push(shape);
    }
    return result;
}

function change(val: any, type: string) {
    const shapes = noGroupShapesFrom(props.context.selection.selectedShapes);
    val = get_value_from_input(val);
    if (rect.value) {
        setting_for_extend(val, type, shapes);
        return;
    }
    const page = props.context.selection.selectedPage!;
    const editor = props.context.editor4Page(page);
    editor.shapesModifyRadius(shapes, [val]);

    hidden_selection(props.context);
}

function keydownRadius(event: KeyboardEvent, type: string) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keyupdate.value = true;
        const target = event.target as HTMLInputElement;
        let value: number = sortValue(target.value) + (event.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const shapes = noGroupShapesFrom(props.context.selection.selectedShapes);
        value = get_value_from_input(value);
        if (rect.value) {
            setting_for_extend(value, type, shapes);
        } else {
            props.linearApi.shapesModifyRadius(shapes, [value])
        }
        event.preventDefault();
    }

}

function setting_for_extend(val: number, type: string, shapes: ShapeView[]) {
    const indexes = get_indexes2(type as 'rt' | 'lt' | 'rb' | 'lb');
    const page = props.context.selection.selectedPage!;

    const editor = props.context.editor4Page(page);

    const values = [-1, -1, -1, -1];
    values[indexes[0]] = val;
    if (keyupdate.value) {
        props.linearApi.shapesModifyRadius(shapes, values)
    } else {
        editor.shapesModifyRadius(shapes, values);
    }

}

function checkKeyup(event: KeyboardEvent) {
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        keyupdate.value = false
    }
}

function rectToggle() {
    rect.value = !rect.value;
    localStorage.setItem('radius-corner-display', rect.value ? 'all' : 'corner');
    modify_radius_value();
}

function update() {
    modify_can_be_rect();
    modify_radius_value();
}

function selection_watcher(t: Number | string) {
    if (t !== Selection.CHANGE_SHAPE) return;
    update();
    watch_shapes();
}

function modify_can_be_rect() {
    can_be_rect.value = false;
    const origin = rect.value;
    rect.value = false;

    const selected = props.context.selection.selectedShapes;
    for (let i = 0, l = selected.length; i < l; i++) {
        if (selected[i].radiusType !== RadiusType.Rect) return;
    }

    can_be_rect.value = true;
    rect.value = origin;
}

function reset_radius_value() {
    radius.lt = 0;
    radius.rt = 0;
    radius.rb = 0;
    radius.lb = 0;
}

function get_radius_for_shape(shape: ShapeView) {
    if (shape.radiusType === RadiusType.Rect) {
        if (shape instanceof PathShapeView) {
            const s = shape as PathShapeView;

            const points = s?.segments[0]?.points;

            if (!points?.length) return 0;

            let _r = points[0].radius || s.fixedRadius || 0;

            for (let i = 1, l = points.length; i < l; i++) {
                if ((points[i].radius || s.fixedRadius || 0) !== _r) return mixed;
            }
            return _r;
        } else {
            const cornerRadius = (shape as SymbolView).cornerRadius;
            if (!cornerRadius) return 0;
            if (cornerRadius.lt === cornerRadius.rt
                && cornerRadius.rt === cornerRadius.rb
                && cornerRadius.rb === cornerRadius.lb) {
                return cornerRadius.lt;
            }
            return mixed;
        }
    }

    if (shape instanceof PathShapeView) {
        const s = shape as PathShapeView;
        const segments = s.segments;
        if (!segments.length) return 0;
        const firstPoint = segments[0].points[0];
        if (!firstPoint) {
            return 0;
        }

        let _r = firstPoint.radius || s.fixedRadius || 0;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const points = segment.points;

            if (!points?.length) continue;

            for (let j = 0; j < points.length; j++) {
                if ((points[j].radius || s.fixedRadius || 0) !== _r) return mixed;
            }
        }

        return _r;
    } else {
        return shape.fixedRadius || 0;
    }
}

function get_all_values(shapes: ShapeView[]) {
    reset_radius_value();
    const first_shape = shapes[0];
    if (!first_shape) return;
    const f_r = get_rect_shape_all_value(first_shape);
    radius.lt = fixedZero(f_r.lt);
    radius.rt = fixedZero(f_r.rt);
    radius.rb = fixedZero(f_r.rb);
    radius.lb = fixedZero(f_r.lb);

    for (let i = 1, l = shapes.length; i < l; i++) {
        const shape = shapes[i];
        const rs = get_rect_shape_all_value(shape);
        if (rs.lt !== radius.lt) {
            radius.lt = mixed;
        }
        if (rs.rt !== radius.rt) {
            radius.rt = mixed;
        }
        if (rs.rb !== radius.rb) {
            radius.rb = mixed;
        }
        if (rs.lb !== radius.lb) {
            radius.lb = mixed;
        }
    }
}

function get_rect_shape_all_value(shape: ShapeView) {
    const rs = { lt: 0, rt: 0, rb: 0, lb: 0 };
    if (shape instanceof PathShapeView) {
        const s = shape as PathShapeView;
        const points = s?.segments[0]?.points;
        if (!points?.length) return rs;
        rs.lt = points[0]?.radius || s.fixedRadius || 0;
        rs.rt = points[1]?.radius || s.fixedRadius || 0;
        rs.rb = points[2]?.radius || s.fixedRadius || 0;
        rs.lb = points[3]?.radius || s.fixedRadius || 0;
    } else {
        const cornerRadius = (shape as SymbolView).cornerRadius;
        if (cornerRadius) {
            rs.lt = cornerRadius.lt;
            rs.rt = cornerRadius.rt;
            rs.rb = cornerRadius.rb;
            rs.lb = cornerRadius.lb;
        }
    }
    // if (shape.isVirtualShape) {
    //     let parent = shape.parent;
    //     while (parent) {
    //         const scale = parent.scale;
    //         if (scale) {
    //             rs.lt *= scale;
    //             rs.rt *= scale;
    //             rs.rb *= scale;
    //             rs.lb *= scale;
    //         }
    //         if (!parent.isVirtualShape) break;
    //         parent = parent.parent;
    //     }
    // }
    return rs;
}

function modify_radius_value() {
    reset_radius_value();

    const selected = noGroupShapesFrom(props.context.selection.selectedShapes);
    if (!selected.length) return;

    if (rect.value) {
        get_all_values(selected);
        return;
    }

    let init = get_radius_for_shape(selected[0]);

    if (typeof init === 'string') {
        radius.lt = init;
        return;
    }

    for (let i = 1, l = selected.length; i < l; i++) {
        const __r = get_radius_for_shape(selected[i]);
        if (__r !== init) {
            radius.lt = mixed;
            return;
        }
    }

    radius.lt = fixedZero(init);
}

const watchedShapes = new Map();

function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    const selectedShapes = noGroupShapesFrom(props.context.selection.selectedShapes);
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => {
            v.watch(update);
        });
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

    lockMouseHandler = new LockMouse(props.context, e, noGroupShapesFrom(props.context.selection.selectedShapes));
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

function draggingLT(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) return;

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    if (isNaN(Number(radius.lt))) return;

    let values = [Number(radius.lt), -1, -1, -1];
    values[0] += e.movementX;

    values[0] = values[0] < 0 ? 0 : values[0]

    if (!rect.value) {
        values = [values[0]]
    }

    lockMouseHandler.executeRadius(values);
}

function draggingRT(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    if (isNaN(Number(radius.rt))) {
        return;
    }

    const values = [-1, Number(radius.rt), -1, -1];

    values[1] += e.movementX;

    values[1] = values[1] < 0 ? 0 : values[1]

    lockMouseHandler.executeRadius(values);
}

function draggingRB(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    if (isNaN(Number(radius.rb))) {
        return;
    }

    const values = [-1, -1, Number(radius.rb), -1];
    values[2] += e.movementX;

    values[2] = values[2] < 0 ? 0 : values[2]

    lockMouseHandler.executeRadius(values);
}

function draggingLB(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!lockMouseHandler) {
        return
    }

    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }

    if (isNaN(Number(radius.lb))) {
        return;
    }

    const values = [-1, -1, -1, Number(radius.lb)];
    values[3] += e.movementX;

    values[3] = values[3] < 0 ? 0 : values[3]

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

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    update();
    watch_shapes();
});
onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <div class="tr">
        <MossInput icon="radius" :draggable="radius.lt !== mixed" :value="radius.lt" :disabled="disabled"
            @change="value => change(value, 'lt')" @dragstart="dragstart" @dragging="draggingLT" @dragend="dragend"
            @keydown="keydownRadius($event, 'lt')" @keyup="checkKeyup">
        </MossInput>
        <div class="space" v-if="!rect"></div>
        <MossInput v-if="rect" class="r-90" icon="radius" :draggable="radius.rt !== mixed" :value="radius.rt"
            :disabled="disabled" @change="value => change(value, 'rt')" @dragstart="dragstart" @dragging="draggingRT"
            @dragend="dragend" @keydown="keydownRadius($event, 'rt')" @keyup="checkKeyup"></MossInput>
        <Tooltip v-if="can_be_rect" :content="t('attr.independentCorners')">
            <div class="more-for-radius" @click="rectToggle" :class="{ 'active': rect }">
                <svg-icon :icon-class="rect ? 'white-for-radius' : 'more-for-radius'"
                    :class="{ 'active': rect }"></svg-icon>
            </div>
        </Tooltip>
    </div>
    <div class="tr" v-if="rect">
        <MossInput class="r-270" icon="radius" :draggable="radius.lb !== mixed" :value="radius.lb"
            :disabled="disabled" @change="value => change(value, 'lb')" @dragstart="dragstart" @dragging="draggingLB"
            @dragend="dragend" @keydown="keydownRadius($event, 'lb')" @keyup="checkKeyup"></MossInput>
        <MossInput class="r-180" icon="radius" :draggable="radius.rb !== mixed" :value="radius.rb"
            :disabled="disabled" @change="value => change(value, 'rb')" @dragstart="dragstart" @dragging="draggingRB"
            @dragend="dragend" @keydown="keydownRadius($event, 'rb')" @keyup="checkKeyup"></MossInput>
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

        >svg {
            transition: 0.3s;
            color: #808080;
            width: 14px;
            height: 14px;
        }

        >svg.active {
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
        :deep(svg) {
            transform: rotate(90deg);
        }
    }

    .r-180 {
        :deep(svg) {
            transform: rotate(180deg);
        }
    }

    .r-270 {
        :deep(svg) {
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