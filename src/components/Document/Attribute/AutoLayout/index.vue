<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import { adapt2Shape, ArtboradView, AutoLayout, PaddingDir, Shape, ShapeType, ShapeView, StackMode, StackSizing, StackWrap, SymbolRefView, SymbolView } from '@kcdesign/data';
import { computeString, getName } from '@/utils/content';
import { Selection } from '@/context/selection';
import AutoLayoutInput from "./AutoLayoutInput.vue"
import { AutoLayoutHandler } from '@/transform/autoLayout';
import AutoLayoutAlign from './AutoLayoutAlign.vue';
import Tooltip from '@/components/common/Tooltip.vue';
import AutoLayoutSetting from "./AutoLayoutSetting.vue"
import { compare_layer_3, filter_for_group1 } from '@/utils/group_ungroup';

interface Props {
    context: Context
    shapes: ShapeView[]
    trigger: any[];
    selectionChange: number;
}

const props = defineProps<Props>();
const { t } = useI18n();
const isActive = ref(false);
const autoLayoutDate = ref<AutoLayout>();
const horSpaceMenu = ref(false);
const verSpaceMenu = ref(false);
const horSizingMenu = ref(false);
const verSizingMenu = ref(false);
const unfold = ref(false);
const reflush = ref(0);
const isDisable = ref(false);

function autoLayout(): void {
    const selectShapes = props.context.selection.selectedShapes;
    let shapes
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const bro = Array.from(page.shapes.values());
    const editor = props.context.editor4Page(page);
    const name = getName(ShapeType.Artboard, bro || [], t);
    if (props.shapes.length > 1) {
        shapes = filter_for_group1(selectShapes);
        shapes = compare_layer_3(shapes);
    } else {
        shapes = selectShapes[0].childs;
    }
    if (props.shapes.length > 1) {
        editor.create_autolayout_artboard(shapes, name);
    } else {
        const editor = props.context.editor4Shape(selectShapes[0]);
        editor.addAutoLayout();
    }
}

const deleteAutoLayout = () => {
    const selectShapes = props.context.selection.selectedShapes;
    const editor = props.context.editor4Shape(selectShapes[0]);
    editor.deleteAutoLayout();
}

const update = () => {
    isLayout();
}

const updateData = () => {
    const selection = props.context.selection.selectedShapes;
    if (selection.length !== 1) return;
    const shape = selection[0] as ArtboradView;
    if (!shape.autoLayout) return;
    autoLayoutDate.value = shape.autoLayout;
    isDisable.value = shape instanceof SymbolRefView;
    reflush.value++;
}

const watchedShapes = new Map();

function watchShapes() { // 监听相关shape的变化
    const needWatchShapes = new Map();
    const selection = props.context.selection.selectedShapes[0];
    if (selection) {
        needWatchShapes.set(selection.id, selection);
    }
    watchedShapes.forEach((v, k) => {
        if (needWatchShapes.has(k)) return;
        v.unwatch(updateData);
        watchedShapes.delete(k);
    })
    needWatchShapes.forEach((v, k) => {
        if (watchedShapes.has(k)) return;
        v.watch(updateData);
        watchedShapes.set(k, v);
    })
}

const changeLayoutMode = (wrap: StackWrap, mode: StackMode) => {
    const selection = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4Shape(selection);
    editor.modifyAutoLayoutDispersed(wrap, mode);
}

const changeHorSpace = (value: string) => {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(2);

    const space: number = Number.parseFloat(value);
    if (isNaN(space)) return;

    const shapes = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4Shape(shapes);
    editor.modifyAutoLayoutSpace(space, 'hor');
}

const changeVorSpace = (value: string) => {
    value = Number
        .parseFloat(computeString(value))
        .toFixed(2);

    let space: number = Number.parseFloat(value);
    if (isNaN(space)) return;

    const shape = props.context.selection.selectedShapes[0] as ArtboradView;
    const editor = props.context.editor4Shape(shape);
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    if (autoLayout.stackMode !== StackMode.Vertical && space < 0) {
        space = 0;
    }
    editor.modifyAutoLayoutSpace(space, 'ver');
}

const changePadding = (value: string, dir: PaddingDir) => {
    const shapes = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4Shape(shapes);

    if (dir === 'hor') {
        if (value.includes(',')) {
            const vulerArray = value.split(',');
            const hor = Number(parseFloat(vulerArray[0].trim()).toFixed(2));
            const right = Number(parseFloat(vulerArray[1].trim()).toFixed(2));
            if (isNaN(hor) || isNaN(right)) return;
            editor.modifyAutoLayoutHorPadding(hor, right);
        } else {
            value = Number.parseFloat(computeString(value)).toFixed(2);
            const padding: number = Number.parseFloat(value);
            if (isNaN(padding)) return;
            editor.modifyAutoLayoutHorPadding(padding, padding);
        }
    } else if (dir === 'ver') {
        if (value.includes(',')) {
            const vulerArray = value.split(',');
            const ver = Number(parseFloat(vulerArray[0].trim()).toFixed(2));
            const bottom = Number(parseFloat(vulerArray[1].trim()).toFixed(2));
            if (isNaN(ver) || isNaN(bottom)) return;
            editor.modifyAutoLayoutVerPadding(ver, bottom);
        } else {
            value = Number.parseFloat(computeString(value)).toFixed(2);
            const padding: number = Number.parseFloat(value);
            if (isNaN(padding)) return;
            editor.modifyAutoLayoutVerPadding(padding, padding);
        }
    } else {
        value = Number.parseFloat(computeString(value)).toFixed(2);
        const padding: number = Number.parseFloat(value);
        if (isNaN(padding)) return;
        editor.modifyAutoLayoutPadding(padding, dir);
    }
}

const tel = ref<boolean>(false);
const telX = ref<number>(0);
const telY = ref<number>(0);
let autoLayoutModifyHandler: AutoLayoutHandler | undefined = undefined;

function updatePosition(movementX: number, movementY: number) {
    const clientHeight = document.documentElement.clientHeight;
    const clientWidth = document.documentElement.clientWidth;
    telX.value += movementX;
    telY.value += movementY;
    telX.value = telX.value < 0 ? clientWidth : (telX.value > clientWidth ? 0 : telX.value);
    telY.value = telY.value < 0 ? clientHeight : (telY.value > clientHeight ? 0 : telY.value);
}

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
    autoLayoutModifyHandler = new AutoLayoutHandler(props.context, e);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
}

function modifyTelUp() {
    tel.value = false;
    document.exitPointerLock();

    autoLayoutModifyHandler?.fulfil();
    autoLayoutModifyHandler = undefined;
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

function draggingHorSpace(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!autoLayoutModifyHandler) {
        return
    }

    if (!autoLayoutModifyHandler.asyncApiCaller) {
        autoLayoutModifyHandler.createApiCaller();
    }
    const shape = props.context.selection.selectedShapes[0] as ArtboradView;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    let space = e.movementX;
    space += autoLayout.stackSpacing;
    autoLayoutModifyHandler.executeSpace(space, 'hor');
}

function draggingVerSpace(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);

    if (!autoLayoutModifyHandler) {
        return
    }

    if (!autoLayoutModifyHandler.asyncApiCaller) {
        autoLayoutModifyHandler.createApiCaller();
    }
    const shape = props.context.selection.selectedShapes[0] as ArtboradView;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    let space = e.movementX;
    space += autoLayout.stackCounterSpacing;
    if (autoLayout.stackMode !== StackMode.Vertical && space < 0) {
        space = 0;
    }
    autoLayoutModifyHandler.executeSpace(space, 'ver');
}

function draggingPadding(e: MouseEvent, dir: PaddingDir) {
    updatePosition(e.movementX, e.movementY);

    if (!autoLayoutModifyHandler) {
        return
    }

    if (!autoLayoutModifyHandler.asyncApiCaller) {
        autoLayoutModifyHandler.createApiCaller();
    }
    const shape = props.context.selection.selectedShapes[0] as ArtboradView;
    const autoLayout = shape.autoLayout;
    if (!autoLayout) return;
    let padding = e.movementX;
    if (dir === 'hor') {
        const h = padding + autoLayout.stackHorizontalPadding;
        const r = padding + autoLayout.stackPaddingRight;
        autoLayoutModifyHandler.executePadding(h, dir, r);
    } else if (dir === 'ver') {
        const v = padding + autoLayout.stackVerticalPadding;
        const b = padding + autoLayout.stackPaddingBottom;
        autoLayoutModifyHandler.executePadding(v, dir, b);
    } else {
        if (dir === 'top') {
            padding += autoLayout.stackVerticalPadding;
        } else if (dir === 'left') {
            padding += autoLayout.stackHorizontalPadding;
        } else if (dir === 'right') {
            padding += autoLayout.stackPaddingRight;
        } else if (dir === 'bottom') {
            padding += autoLayout.stackPaddingBottom;
        }
        autoLayoutModifyHandler.executePadding(padding, dir);
    }
}

function dragend() {
    modifyTelUp();
}

const changeSizing = (value: StackSizing, dir: PaddingDir) => {
    const shapes = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4Shape(shapes);
    editor.modifyAutoLayoutSizing(value, dir);
}

const changeGapSizing = (value: StackSizing, dir: PaddingDir) => {
    const shapes = props.context.selection.selectedShapes[0];
    const editor = props.context.editor4Shape(shapes);
    editor.modifyAutoLayoutGapSizing(value, dir);
}

function paddingValue(v1: number, v2: number) {
    if (v1 === v2) {
        return v1;
    } else {
        return `${v1}, ${v2}`
    }
}

const shwoHorSpaceMenu = (v: boolean) => {
    horSpaceMenu.value = v;
    verSpaceMenu.value = false;
    horSizingMenu.value = false;
    verSizingMenu.value = false;
}
const shwoVerSpaceMenu = (v: boolean) => {
    verSpaceMenu.value = v;
    horSpaceMenu.value = false;
    horSizingMenu.value = false;
    verSizingMenu.value = false;
}

const shwoHorSizingMenu = (v: boolean) => {
    horSizingMenu.value = v;
    horSpaceMenu.value = false;
    verSpaceMenu.value = false;
    verSizingMenu.value = false;
}

const shwoVerSizingMenu = (v: boolean) => {
    verSizingMenu.value = v;
    horSpaceMenu.value = false;
    horSizingMenu.value = false;
    verSpaceMenu.value = false;
}

const selectionWatcher = (t: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        updateData();
        watchShapes();
    }
}

const isLayout = () => {
    const shapes = props.context.selection.selectedShapes;
    if (shapes.length > 1) {
        isActive.value = true;
    } else {
        const shape = (shapes[0] as ArtboradView)
        if (!shape.autoLayout) {
            isActive.value = true;
        } else {
            isActive.value = false;
        }
    } 0
}
watch(() => isActive.value, () => {
    updateData();
});

const stop = watch(() => props.trigger, update); // 监听图层变化
const stop2 = watch(() => props.selectionChange, () => {
    isLayout();
    updateData();
}); // 监听选区变化
onMounted(() => {
    isLayout();
    updateData();
    watchShapes();
    props.context.selection.watch(selectionWatcher);
});
onUnmounted(() => {
    stop();
    stop2();
    props.context.selection.unwatch(selectionWatcher);
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
});

import SvgIcon from '@/components/common/SvgIcon.vue';
import add_icon from '@/assets/icons/svg/add.svg';
import delete_icon from '@/assets/icons/svg/delete.svg';
import ver_arrow_icon from '@/assets/icons/svg/ver-arrow.svg';
import hor_arrow_icon from '@/assets/icons/svg/hor-arrow.svg';
import wrap_arrow_icon from '@/assets/icons/svg/wrap-arrow.svg';
import white_padding_button_icon from '@/assets/icons/svg/white-padding-button.svg';
import border_all_icon from '@/assets/icons/svg/border-all.svg';
</script>

<template>
    <div class="layout-panel">
        <TypeHeader :title="t('autolayout.auto_layout')" class="mt-24" @click="autoLayout" :active="!isActive">
            <template #tool>
                <div v-if="isActive" class="add" @click.stop="autoLayout">
                    <SvgIcon :icon="add_icon"/>
                </div>
                <div v-else class="add" @click.stop="deleteAutoLayout">
                    <SvgIcon :icon="delete_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div class="container-top" :class="{ disabled: isDisable }" v-if="!isActive && autoLayoutDate">
            <div class="container-left">
                <div class="layout-wrap" :reflush="reflush">
                    <div :class="{ active: autoLayoutDate.stackMode === StackMode.Vertical }"
                        @click="changeLayoutMode(StackWrap.NoWrap, StackMode.Vertical)">
                        <Tooltip :content="t(`autolayout.ver`)">
                            <SvgIcon :icon="ver_arrow_icon"/>
                        </Tooltip>
                    </div>
                    <div @click="changeLayoutMode(StackWrap.NoWrap, StackMode.Horizontal)"
                        :class="{ active: autoLayoutDate.stackMode === StackMode.Horizontal && autoLayoutDate.stackWrap === StackWrap.NoWrap }">
                        <Tooltip :content="t(`autolayout.hor`)">
                            <SvgIcon :icon="hor_arrow_icon"/>
                        </Tooltip>
                    </div>
                    <div :class="{ active: !autoLayoutDate.stackWrap || autoLayoutDate.stackWrap === StackWrap.Wrap }"
                        @click="changeLayoutMode(StackWrap.Wrap, StackMode.Horizontal)">
                        <Tooltip :content="t(`autolayout.wrap`)">
                            <SvgIcon :icon="wrap_arrow_icon"/>
                        </Tooltip>
                    </div>
                </div>
                <div class="hor" v-if="autoLayoutDate.stackMode !== StackMode.Vertical">
                    <AutoLayoutInput icon="hor-space" :isMenu="true" :show="horSpaceMenu" name="hor_gap"
                        :draggable="autoLayoutDate.stackHorizontalGapSizing === StackSizing.Auto"
                        :item="autoLayoutDate.stackSpacing"
                        :value="autoLayoutDate.stackHorizontalGapSizing === StackSizing.Auto ? t(`autolayout.${StackSizing.Auto}`) : autoLayoutDate.stackSpacing"
                        @change="changeHorSpace" @shwoMenu="shwoHorSpaceMenu" @dragstart="dragstart"
                        @dragging="draggingHorSpace" @dragend="dragend" @changeItem="(v) => changeGapSizing(v, 'hor')">
                    </AutoLayoutInput>
                </div>
                <div class="ver"
                    v-if="!autoLayoutDate.stackWrap || autoLayoutDate.stackMode === StackMode.Vertical || autoLayoutDate.stackWrap === StackWrap.Wrap">
                    <AutoLayoutInput icon="ver-space" :isMenu="true" :show="verSpaceMenu" name="ver_gap"
                        :draggable="autoLayoutDate.stackVerticalGapSizing === StackSizing.Auto"
                        :item="autoLayoutDate.stackCounterSpacing"
                        :value="autoLayoutDate.stackVerticalGapSizing === StackSizing.Auto ? t(`autolayout.${StackSizing.Auto}`) : autoLayoutDate.stackCounterSpacing"
                        @change="changeVorSpace" @shwoMenu="shwoVerSpaceMenu" @dragstart="dragstart"
                        @dragging="draggingVerSpace" @dragend="dragend" @changeItem="(v) => changeGapSizing(v, 'ver')">
                    </AutoLayoutInput>
                </div>
            </div>
            <div class="container-center">
                <div class="layout-wrap" :reflush="reflush">
                    <AutoLayoutAlign :reflush="reflush" :autoLayoutDate="autoLayoutDate" :context="context">
                    </AutoLayoutAlign>
                </div>
            </div>
            <div class="container-right">
                <Tooltip :content="t(`autolayout.settings`)">
                    <div>
                        <AutoLayoutSetting :reflush="reflush" :autoLayoutDate="autoLayoutDate" :context="context">
                        </AutoLayoutSetting>
                    </div>
                </Tooltip>
            </div>
        </div>
        <div class="layout-padding" :class="{ disabled: isDisable }" v-if="!isActive && autoLayoutDate">
            <div class="container-input">
                <AutoLayoutInput :icon="unfold ? 'left-padding' : 'hor-padding'"
                    :name="unfold ? 'left_padding' : 'hor_padding'"
                    :value="unfold ? autoLayoutDate.stackHorizontalPadding : paddingValue(autoLayoutDate.stackHorizontalPadding, autoLayoutDate.stackPaddingRight)"
                    @change="(v) => changePadding(v, unfold ? 'left' : 'hor')" @dragstart="dragstart"
                    @dragging="(e) => draggingPadding(e, unfold ? 'left' : 'hor')" @dragend="dragend">
                </AutoLayoutInput>
                <AutoLayoutInput v-if="unfold" icon="right-padding" :value="autoLayoutDate.stackPaddingRight"
                    name="right_padding" @change="(v) => changePadding(v, 'right')" @dragstart="dragstart"
                    @dragging="(e) => draggingPadding(e, 'right')" @dragend="dragend">
                </AutoLayoutInput>
            </div>
            <div class="container-input">
                <AutoLayoutInput :icon="unfold ? 'top-padding' : 'ver-padding'"
                    :name="unfold ? 'top_padding' : 'ver_padding'"
                    :value="unfold ? autoLayoutDate.stackVerticalPadding : paddingValue(autoLayoutDate.stackVerticalPadding, autoLayoutDate.stackPaddingBottom)"
                    @change="(v) => changePadding(v, unfold ? 'top' : 'ver')" @dragstart="dragstart"
                    @dragging="(e) => draggingPadding(e, unfold ? 'top' : 'ver')" @dragend="dragend">
                </AutoLayoutInput>
                <AutoLayoutInput v-if="unfold" icon="bottom-padding" :value="autoLayoutDate.stackPaddingBottom"
                    name="bottom_padding" @change="(v) => changePadding(v, 'bottom')" @dragstart="dragstart"
                    @dragging="(e) => draggingPadding(e, 'bottom')" @dragend="dragend">
                </AutoLayoutInput>
            </div>
            <div class="container-right">
                <Tooltip :content="t(`autolayout.${!unfold ? 'unfold' : 'fold'}`)">
                    <div :class="{ 'padding-active': unfold }" @click="unfold = !unfold">
                        <SvgIcon :icon="unfold ? white_padding_button_icon : border_all_icon"/>
                    </div>
                </Tooltip>
            </div>
        </div>
        <div class="layout-area-size" :class="{ disabled: isDisable }" v-if="!isActive && autoLayoutDate">
            <div class="title">{{ t('autolayout.layout_area_size') }}</div>
            <div class="area-options">
                <AutoLayoutInput
                    :icon="autoLayoutDate.stackPrimarySizing === StackSizing.Auto ? 'layout-auto' : 'layout-fixed'"
                    :name="autoLayoutDate.stackPrimarySizing === StackSizing.Auto ? 'hor_resizing' : 'hor_fixed'"
                    :isMenu="true" :show="horSizingMenu" :disabled="true" :item="t(`autolayout.${StackSizing.Fixed}`)"
                    :value="autoLayoutDate.stackPrimarySizing === StackSizing.Auto ? t(`autolayout.adapt`) : t(`autolayout.${StackSizing.Fixed}`)"
                    @changeItem="(v) => changeSizing(v, 'hor')" @shwoMenu="shwoHorSizingMenu">
                </AutoLayoutInput>
                <AutoLayoutInput
                    :icon="autoLayoutDate.stackCounterSizing === StackSizing.Fixed ? 'layout-ver-fixed' : 'layout-ver-auto'"
                    :name="autoLayoutDate.stackCounterSizing === StackSizing.Fixed ? 'ver_fixed' : 'ver_resizing'"
                    :isMenu="true" :show="verSizingMenu" :disabled="true" :item="t(`autolayout.${StackSizing.Fixed}`)"
                    :value="autoLayoutDate.stackCounterSizing === StackSizing.Fixed ? t(`autolayout.${StackSizing.Fixed}`) : t(`autolayout.adapt`)"
                    @changeItem="(v) => changeSizing(v, 'ver')" @shwoMenu="shwoVerSizingMenu">
                </AutoLayoutInput>
            </div>
        </div>
    </div>
    <teleport to="body">
        <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }">
        </div>
    </teleport>
</template>

<style scoped lang="scss">
.layout-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .add {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    .container-top {
        width: 224px;
        padding-top: 8px;
        display: flex;
        gap: 8px;
        justify-content: space-between;

        .container-left {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 88px;

            .layout-wrap {
                width: 88px;
                height: 32px;
                border-radius: 6px;
                background-color: #F4F5F5;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2px;
                box-sizing: border-box;

                div {
                    height: 28px;
                    width: 28px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    outline: none;

                    >svg {
                        outline: none;
                        width: 14px;
                        height: 14px;
                    }
                }
            }
        }

        .container-center {
            flex: 1;
        }

        .container-right {
            width: 32px;
            display: flex;
            justify-content: flex-end;

            div {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                display: flex;
                justify-content: center;
                align-items: center;

                >svg {
                    width: 14px;
                    height: 14px;
                }

                &:hover {
                    background-color: #F5F5F5;
                }
            }

        }

    }

    .layout-padding {
        width: 224px;
        padding: 8px 0;
        display: flex;
        gap: 8px;
        justify-content: space-between;

        .container-input {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 88px;
        }

        .container-right {
            width: 32px;
            display: flex;
            justify-content: flex-end;

            >div {
                width: 32px;
                height: 32px;
                box-sizing: border-box;
                border-radius: 6px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 1px solid #EBEBEB;

                >svg {
                    width: 14px;
                    height: 14px;
                }

                &:hover {
                    background-color: #F5F5F5;
                }
            }

        }
    }

    .layout-area-size {
        width: 224px;

        .title {
            font-size: 12px;
            color: #BFBFBF;
        }

        .area-options {
            display: flex;
            gap: 8px;
            width: 88px;
            padding: 8px 0;
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

.active {
    background-color: #fff;
}

.padding-active {
    background-color: #1989FC !important;
    border: none;
}

.disabled {
    pointer-events: none;
    opacity: 0.4;
}
</style>