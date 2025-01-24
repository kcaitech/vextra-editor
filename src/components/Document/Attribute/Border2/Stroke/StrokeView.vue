<script setup lang="ts">
import { Context } from '@/context';
import { StrokeFillContextMgr } from '../ctx';
import BorderDetail from './BorderDetail.vue';
import { AsyncBorderThickness, BorderPosition, BorderSideSetting, LinearApi, ShapeType } from '@kcdesign/data';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import thickness_icon from '@/assets/icons/svg/thickness.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useI18n } from 'vue-i18n';
import { genOptions } from '@/utils/common';
import { ref, watch } from 'vue';
import { getShapesForStyle } from '@/utils/style';
import { get_actions_border, get_actions_border_position, get_actions_border_thickness } from '@/utils/shape_style';
import { getSideThickness } from '../index';
import { sortValue } from '../../BaseAttr/oval';
import { flattenShapes } from '@/utils/cutout';

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


function positionSelect(selected: SelectItem, id: number | undefined) {
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    const shapes = getShapesForStyle(selecteds).filter(s => s.type !== ShapeType.Line);
    const actions = get_actions_border_position(shapes, id!, selected.value as BorderPosition);
    if (actions && actions.length) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderPosition(actions);
    }
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
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    if (thickness > 300) thickness = 300;
    const shapes = getShapesForStyle(selecteds);
    const t = thickness < 0 ? 0 : thickness;
    const actions = get_actions_border(shapes, t);
    if (actions && actions.length) {
        const editor = props.context.editor4Page(page);
        editor.setShapesBorderThickness(actions);
    }
}

function keydownThickness(event: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    let old = value;
    const selecteds = props.context.selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (!page || selecteds.length < 1) return;
    if (event.code === 'ArrowUp' || event.code === "ArrowDown") {
        if (value >= 0) {
            if (value >= 300) {
                value = 300;
            }
            value = value + (event.code === 'ArrowUp' ? 1 : -1);
            if (isNaN(value)) return;
            value = value <= 0 ? 0 : value <= 300 ? value : 300;
            const shapes = getShapesForStyle(selecteds);
            const actions = get_actions_border(shapes, value);
            if (actions && actions.length) {
                if (old !== value) linearApi.modifyShapesBorderThickness(actions);
            }
        }
        event.preventDefault();
    }
}

const pointX = ref<number>();
const pointY = ref<number>();
const showpoint = ref<boolean>(false);
const rotate = ref<boolean>();
const borderThickness = ref<HTMLInputElement>();
let borderthickness_editor: AsyncBorderThickness | undefined = undefined;

async function onMouseDown(e: MouseEvent) {
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage;
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
    borderthickness_editor = props.context.editor.controller().asyncBorderThickness(shapes, page!);
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
    if (borderthickness_editor) {
        borderthickness_editor.close();
        borderthickness_editor = undefined;
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
    const selected = props.context.selection.selectedShapes;
    const shapes = flattenShapes(selected).filter(s => s.type !== ShapeType.Group);
    const page = props.context.selection.selectedPage;
    if (!page || shapes.length < 1) return;
    const strokeInfo = props.manager.fillCtx.strokeInfo!;
    if (borderThickness.value && typeof strokeInfo.sideSetting !== 'string') {
        let thickness = (getSideThickness(strokeInfo.sideSetting) || 0) + e.movementX;
        if (thickness > 300) thickness = 300;
        const actions = get_actions_border_thickness(shapes, thickness < 0 ? 0 : thickness);
        if (actions && actions.length && borderthickness_editor) {
            borderthickness_editor.execute(thickness < 0 ? 0 : thickness);
        }
    }
}


</script>

<template>
    <div class="borders-container" v-if="manager.fillCtx.fills.length && manager.fillCtx.strokeInfo">
        <div class="bottom">
            <div class="test" style=" flex: calc(50% - 20px);"
                :style="{ pointerEvents: [ShapeType.Table, ShapeType.Line].includes(manager.selected[0].type) ? 'none' : 'auto' }">
                <Select class="select" :context="context" :shapes="manager.selected" :source="positonOptionsSource"
                    :selected="positoSelected()" @select="positionSelect" :index="0"
                    :mixed="manager.fillCtx.strokeInfo.position === 'mixed'"></Select>
            </div>
            <div class="thickness-container" style=" flex: calc(50% - 20px);" :class="{ actived: isActived }">
                <SvgIcon :icon="thickness_icon"
                    :class="{ cursor_pointer: typeof manager.fillCtx.strokeInfo.sideSetting === 'string' }"
                    @mousedown.stop="onMouseDown($event)" />
                <input ref="borderThickness" type="text" :value="thickness_value()" @change="setThickness($event)"
                    @blur="strokeBlur" @click="strokeClick" @focus="isActived = true;"
                    @keydown="e => keydownThickness(e, thickness_value())">
            </div>
        </div>
        <BorderDetail :context="context" :manager="manager" :trigger="trigger"></BorderDetail>
    </div>
</template>

<style scoped lang="scss">
.borders-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;

    .bottom {
        width: calc(100% - 19px);
        display: flex;
        align-items: center;
        height: 32px;
        gap: 5px;

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
</style>