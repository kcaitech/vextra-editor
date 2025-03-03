<script lang="ts" setup>
import { Context } from '@/context';
import BorderCustomInput from './BorderCustomInput.vue';
import {
    LinearApi,
    ShapeView,
    SideType,
} from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Selection } from '@/context/selection';
import { hidden_selection } from '@/utils/content';
import { useI18n } from 'vue-i18n';
import { customizable } from "../index"
import { Menu } from '@/context/menu';
import { format_value } from "@/utils/common";
import SvgIcon from '@/components/common/SvgIcon.vue';
import border_all_icon from '@/assets/icons/svg/border-all.svg';
import border_top_icon from '@/assets/icons/svg/border-top.svg';
import border_bottom_icon from '@/assets/icons/svg/border-bottom.svg';
import border_left_icon from '@/assets/icons/svg/border-left.svg';
import border_right_icon from '@/assets/icons/svg/border-right.svg';
import border_custom_icon from '@/assets/icons/svg/border-custom.svg';
import { sortValue } from '../../BaseAttr/oval';
import { LockMouse } from '@/transform/lockMouse';
import { getSideSettingType, getThickness, StrokeFillContextMgr } from '../ctx';

const { t } = useI18n();

interface Props {
    context: Context
    manager: StrokeFillContextMgr
    trigger: any[]
}

const props = defineProps<Props>();
const sideType = ref<SideType>();
const shapes = ref<ShapeView[]>();
const topThickness = ref<number | string>(0);
const rightThickness = ref<number | string>(0);
const bottomThickness = ref<number | string>(0);
const leftThickness = ref<number | string>(0);
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!);

let flat: ShapeView[] | undefined = undefined;

function getFlat() {
    return flat ?? props.context.selection.flat.filter(view => customizable.includes(view.type) && !view.data.haveEdit);
}

function update() {
    const flat = getFlat();
    sideType.value = getSideSettingType(flat);

    const thickness = getThickness(flat);
    const mixed = t('attr.more_value');
    topThickness.value = typeof thickness[0] === 'number' ? format_value(thickness[0]) : mixed;
    rightThickness.value = typeof thickness[1] === 'number' ? format_value(thickness[1]) : mixed;
    bottomThickness.value = typeof thickness[2] === 'number' ? format_value(thickness[2]) : mixed;
    leftThickness.value = typeof thickness[3] === 'number' ? format_value(thickness[3]) : mixed;
}

function setSideType(type: SideType) {
    if (sideType.value === type) return;
    props.manager.modifySideType(type, getFlat());
    hidden_selection(props.context);
}

const setSideThickness = (thickness: number, type: SideType) => {
    props.manager.modifyBorderCustomThickness(thickness, type);
}

function keydownThickness(e: KeyboardEvent, val: string | number, type: SideType) {
    if (!shapes.value) return;
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        let value: any = sortValue(val.toString());
        value = value + (e.code === 'ArrowUp' ? 1 : -1)
        if (isNaN(value)) return;
        value = value <= 0 ? 0 : value <= 300 ? value : 300
        linearApi.modifyBorderCustomThickness(props.manager.flat, value, type);
        hidden_selection(props.context);
        e.preventDefault();
    }
}

function selection_watcher(t?: any) {
    if (t === Selection.CHANGE_SHAPE) {
        flat = undefined;
        update();
    }
}

const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let lockMouse: LockMouse | undefined = undefined;

function updatePosition(movementX: number, movementY: number) {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    telX.value += movementX;
    telY.value += movementY;
    telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
    telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}

async function dragStart(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement;
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true
        })
    }
    lockMouse = new LockMouse(props.context, e);
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) dragEnd();
}

const dragging = (e: MouseEvent, thickness: number | string, type: SideType) => {
    if (typeof thickness === 'string') return;
    updatePosition(e.movementX, e.movementY);
    if (!lockMouse) return;
    if (!lockMouse.asyncApiCaller) {
        lockMouse.createApiCaller('translating');
    }
    let val = thickness + e.movementX;
    if (val < 0) {
        val = 0;
    } else if (val > 300) {
        val = 300;
    }
    lockMouse.modifyBorderCustomThickness(props.manager.flat, val, type);
}

const dragEnd = () => {
    tel.value = false;
    document.exitPointerLock();
    if (lockMouse) {
        lockMouse.fulfil();
        lockMouse = undefined;
    }
    document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

const watchList: any[] = [
    watch(() => props.trigger, (v) => {
        if (v?.includes('bordersMask') || v?.includes('borders') || v?.includes('variables')) update();
        if (v?.includes('haveEdit')) flat = undefined;
    }),
    watch(() => sideType.value, (v, o) => {
        if (v === SideType.Custom || o === SideType.Custom) {
            nextTick(() => props.context.menu.notify(Menu.UPDATE_LOCATE));
        }
    }),
    props.context.selection.watch(selection_watcher)
];

onMounted(update);
onUnmounted(() => watchList.forEach(stop => stop()));
</script>

<template>
    <div class="container">
        <div class="border-style">
            <div class="border">{{ t('attr.unilateral') }}</div>
            <div class="border-select">
                <div class="all" :class="{ selected: sideType === SideType.Normal }"
                     @click="setSideType(SideType.Normal)">
                    <SvgIcon :icon="border_all_icon"/>
                </div>
                <div class="top" :class="{ selected: sideType === SideType.Top }" @click="setSideType(SideType.Top)">
                    <SvgIcon :icon="border_top_icon"/>
                </div>
                <div class="bottom" :class="{ selected: sideType === SideType.Bottom }"
                     @click="setSideType(SideType.Bottom)">
                    <SvgIcon :icon="border_bottom_icon"/>
                </div>
                <div class="left" :class="{ selected: sideType === SideType.Left }"
                     @click="setSideType(SideType.Left)">
                    <SvgIcon :icon="border_left_icon"/>
                </div>
                <div class="right" :class="{ selected: sideType === SideType.Right }"
                     @click="setSideType(SideType.Right)">
                    <SvgIcon :icon="border_right_icon"/>
                </div>
                <div class="custom" :class="{ selected: sideType === SideType.Custom }"
                     @click="setSideType(SideType.Custom)">
                    <SvgIcon :icon="border_custom_icon"/>
                </div>
            </div>
        </div>
        <div v-if="sideType === SideType.Custom" class="border-style" style="margin-top: 6px;">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput ticon="top" :shadowV="topThickness"
                                   @onChange="(v) => setSideThickness(v, SideType.Top)"
                                   @dragstart="(e) => dragStart(e)"
                                   @dragging="(e) => dragging(e, topThickness, SideType.Top)"
                                   @dragend="dragEnd"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Top)"></BorderCustomInput>
                <BorderCustomInput ticon="bottom" :shadowV="bottomThickness"
                                   @onChange="(v) => setSideThickness(v, SideType.Bottom)"
                                   @dragstart="(e) => dragStart(e)"
                                   @dragging="(e) => dragging(e, bottomThickness, SideType.Bottom)" @dragend="dragEnd"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Bottom)">
                </BorderCustomInput>
            </div>
        </div>
        <div v-if="sideType === SideType.Custom" class="border-style" style="margin-top: 6px;">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput ticon="left" :shadowV="leftThickness"
                                   @onChange="(v) => setSideThickness(v, SideType.Left)"
                                   @dragstart="(e) => dragStart(e)"
                                   @dragging="(e) => dragging(e, leftThickness, SideType.Left)"
                                   @dragend="dragEnd" @keydown="(e, val) => keydownThickness(e, val, SideType.Left)">
                </BorderCustomInput>
                <BorderCustomInput ticon="right" :shadowV="rightThickness"
                                   @onChange="(v) => setSideThickness(v, SideType.Right)"
                                   @dragstart="(e) => dragStart(e)"
                                   @dragging="(e) => dragging(e, rightThickness, SideType.Right)" @dragend="dragEnd"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Right)">
                </BorderCustomInput>
            </div>
        </div>
        <teleport to="body">
            <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
            </div>
        </teleport>
    </div>
</template>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 12px;
}

.border-style {
    width: 100%;
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .border {
        flex: 0 0 24px;
        box-sizing: border-box;
        width: 24px;
        font-size: 12px;
        color: #737373;
        margin-right: 24px;
    }

    .border-select {
        flex: 1;
        height: 32px;
        border-radius: var(--default-radius);
        background-color: #F5F5F5;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2px;
        box-sizing: border-box;

        > div {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            height: 28px;

            > svg {
                width: 16px;
                height: 16px;
            }
        }
    }

    .border-custom {
        flex: 1;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;

        svg {
            width: 16px;
            height: 16px;
        }
    }
}

.selected {
    background-color: #FFFFFF;
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