<script setup lang="ts">
import { Context } from '@/context';
import { ShadowCatch, ShadowsContextMgr } from './ctx';
import { useI18n } from 'vue-i18n';
import SvgIcon from '@/components/common/SvgIcon.vue';
import gear_icon from '@/assets/icons/svg/gear.svg';
import ShadowInput from './ShadowInput.vue';
import { format_value } from '@/utils/common';
import ColorBlock from "@/components/common/ColorBlock/Index.vue";
import { Color, Fill, FillType, LinearApi, Shadow, ShadowMask, ShapeType } from '@kcdesign/data';
import { selectAllOnFocus } from '../basic';
import { toHex } from '@/utils/color';
import { ref, watchEffect, onUnmounted, reactive } from 'vue';
import ColorPicker from "@/components/common/ColorPicker/Index2.vue";
import { ElementManager, ElementStatus } from '@/components/common/elementmanager';
import { RGBACatch } from '@/components/common/ColorPicker/Editor/solidcolorlineareditor';
import { ShadowColorPicker } from '@/components/common/ColorPicker/Editor/stylectxs/shadowpicker';
import { LockMouse } from '@/transform/lockMouse';
import { get_actions_shadow_blur, get_actions_shadow_offsetx, get_actions_shadow_offsety, get_actions_shadow_spread } from '@/utils/shape_style';
import { hidden_selection } from '@/utils/content';
import { sortValue } from '../BaseAttr/oval';
import PopoverHeader from "@/components/common/PopoverHeader.vue";

const { t } = useI18n();

const props = defineProps<{
    context: Context;
    data: ShadowCatch;
    manager: ShadowsContextMgr;
}>();

function getIndexByShadow(shadow: Shadow) {
    return (shadow.parent as unknown as Shadow[])?.findIndex(i => i === shadow) ?? -1;
}
const colorHex = ref<string>(toHex(props.data.shadow.color).slice(1));
const alpha = ref<string>(Math.round(props.data.shadow.color.alpha * 100) + '%');
const colors = ref<Color[]>([props.data.shadow.color] as Color[]);
const rgba = ref<RGBACatch>({ R: 0, G: 0, B: 0, A: 0.3, position: 1 });
const linearApi = new LinearApi(props.context.coopRepo, props.context.data, props.context.selection.selectedPage!);

const colorPanelStatus = reactive<ElementStatus>({ id: '#color-piker-gen-2-panel', visible: false });
const colorPanelStatusMgr = new ElementManager(
    props.context,
    colorPanelStatus,
    { whiteList: ['#color-piker-gen-2-panel', '.color-wrapper'] }
);

const panelStatus = reactive<ElementStatus>({ id: '#shadow-detail-container', visible: false });
const panelStatusMgr = new ElementManager(
    props.context,
    panelStatus,
    { whiteList: ['#shadow-detail-container', '.shadow-trigger'] }
);

function showColorPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('color-wrapper')) {
            colorPanelStatusMgr.showBy(e, { once: { offsetLeft: -312 } });
            break;
        }
        e = e.parentElement;
    }
}

function showDetailPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    disable();
    while (e) {
        if (e.classList.contains('shadow-trigger')) {
            e && panelStatusMgr.showBy(e, { once: { offsetLeft: -306 } });
            break;
        }
        e = e.parentElement;
    }
}

const setOffsetX = (value: number) => {
    props.manager.modifyShadowOffsetX(value, props.data.shadow);
    hidden_selection(props.context);
}

function keydownOffsetX(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = getIndexByShadow(props.data.shadow);
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        const actions: { shadow: Shadow, value: number }[] = [];
        value = value <= -3000 ? -3000 : value <= 3000 ? value : 3000;
        if (props.data.shadow.parent?.parent instanceof ShadowMask) {
            actions.push({ shadow: props.data.shadow, value });
        } else {
            for (const view of props.manager.flat) {
                const shadow = view.getShadows()[_idx];
                actions.push({ shadow, value });
            }
        }
        linearApi.modifyShapesShadowOffsetX(actions);
        e.preventDefault();
        hidden_selection(props.context);
    }
}

const setOffsetY = (value: number) => {
    props.manager.modifyShadowOffsetY(value, props.data.shadow);
    hidden_selection(props.context);
}

function keydownOffsetY(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = getIndexByShadow(props.data.shadow);
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= -3000 ? -3000 : value <= 3000 ? value : 3000;
        const actions: { shadow: Shadow, value: number }[] = [];
        if (props.data.shadow.parent?.parent instanceof ShadowMask) {
            actions.push({ shadow: props.data.shadow, value });
        } else {
            for (const view of props.manager.flat) {
                const shadow = view.getShadows()[_idx];
                actions.push({ shadow, value });
            }
        }
        linearApi.modifyShapesShadowOffsetY(actions)
        e.preventDefault();
        hidden_selection(props.context);
    }
}

const setBlurRadius = (value: number) => {
    props.manager.modifyShadowBlur(value, props.data.shadow);
    hidden_selection(props.context);
}

function keydownBlurRadius(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = getIndexByShadow(props.data.shadow);
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= 0 ? 0 : value <= 200 ? value : 200;
        const actions: { shadow: Shadow, value: number }[] = [];
        if (props.data.shadow.parent?.parent instanceof ShadowMask) {
            actions.push({ shadow: props.data.shadow, value });
        } else {
            for (const view of props.manager.flat) {
                const shadow = view.getShadows()[_idx];
                actions.push({ shadow, value });
            }
        }
        linearApi.modifyShapesShadowBlur(actions)
        e.preventDefault();
        hidden_selection(props.context);
    }
}

const setSpread = (value: number) => {
    props.manager.modifyShadowSpread(value, props.data.shadow);
    hidden_selection(props.context);
}

function keydownSpread(e: KeyboardEvent, val: string | number) {
    let value: any = sortValue(val.toString());
    const _idx = getIndexByShadow(props.data.shadow);
    if (e.code === 'ArrowUp' || e.code === "ArrowDown") {
        value = value + (e.code === 'ArrowUp' ? 1 : -1);
        if (isNaN(value)) return;
        value = value <= -3000 ? -3000 : value <= 3000 ? value : 3000;
        const actions: { shadow: Shadow, value: number }[] = [];
        if (props.data.shadow.parent?.parent instanceof ShadowMask) {
            actions.push({ shadow: props.data.shadow, value });
        } else {
            for (const view of props.manager.flat) {
                const shadow = view.getShadows()[_idx];
                actions.push({ shadow, value });
            }
        }
        linearApi.modifyShapesShadowSpread(actions)
        e.preventDefault();
        hidden_selection(props.context);
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

async function dragStart(e: MouseEvent) {
    tel.value = true;
    telX.value = e.clientX;
    telY.value = e.clientY;
    const el = e.target as HTMLElement
    if (!document.pointerLockElement) {
        await el.requestPointerLock({
            unadjustedMovement: true,
        });
    }
    lockMouseHandler = new LockMouse(props.context, e);
    document.addEventListener('pointerlockchange', pointerLockChange, false);
}

const pointerLockChange = () => {
    if (!document.pointerLockElement) dragEnd();
}

function draggingX(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    let value = props.data.shadow.offsetX + e.movementX;
    const _idx = getIndexByShadow(props.data.shadow);
    value = value < -3000 ? -3000 : value > 3000 ? 3000 : value;
    if (!lockMouseHandler) return;
    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    const actions: { shadow: Shadow, value: number }[] = [];
    if (props.data.shadow.parent?.parent instanceof ShadowMask) {
        actions.push({ shadow: props.data.shadow, value });
    } else {
        for (const view of props.manager.flat) {
            const shadow = view.getShadows()[_idx];
            actions.push({ shadow, value });
        }
    }
    lockMouseHandler.executeShadowX(actions);
}

function draggingY(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    let value = props.data.shadow.offsetY + e.movementX;
    const _idx = getIndexByShadow(props.data.shadow);
    value = value < -3000 ? -3000 : value > 3000 ? 3000 : value;
    if (!lockMouseHandler) return
    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    const actions: { shadow: Shadow, value: number }[] = [];
    if (props.data.shadow.parent?.parent instanceof ShadowMask) {
        actions.push({ shadow: props.data.shadow, value });
    } else {
        for (const view of props.manager.flat) {
            const shadow = view.getShadows()[_idx];
            actions.push({ shadow, value });
        }
    }
    lockMouseHandler.executeShadowY(actions);
}

function draggingB(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    let value = props.data.shadow.blurRadius + e.movementX;
    const _idx = getIndexByShadow(props.data.shadow);
    value = value < 0 ? 0 : value > 200 ? 200 : value;
    if (!lockMouseHandler) return;
    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    const actions: { shadow: Shadow, value: number }[] = [];
    if (props.data.shadow.parent?.parent instanceof ShadowMask) {
        actions.push({ shadow: props.data.shadow, value });
    } else {
        for (const view of props.manager.flat) {
            const shadow = view.getShadows()[_idx];
            actions.push({ shadow, value });
        }
    }
    lockMouseHandler.executeShadowB(actions);
}

function draggingS(e: MouseEvent) {
    updatePosition(e.movementX, e.movementY);
    let value = props.data.shadow.spread + e.movementX;
    const _idx = getIndexByShadow(props.data.shadow);
    value = value < -3000 ? -3000 : value > 3000 ? 3000 : value;
    if (!lockMouseHandler) return;
    if (!lockMouseHandler.asyncApiCaller) {
        lockMouseHandler.createApiCaller('translating');
    }
    const actions: { shadow: Shadow, value: number }[] = [];
    if (props.data.shadow.parent?.parent instanceof ShadowMask) {
        actions.push({ shadow: props.data.shadow, value });
    } else {
        for (const view of props.manager.flat) {
            const shadow = view.getShadows()[_idx];
            actions.push({ shadow, value });
        }
    }
    lockMouseHandler.executeShadowS(actions);
}

function dragEnd() {
    tel.value = false;
    document.exitPointerLock();
    lockMouseHandler?.fulfil();
    lockMouseHandler = undefined;
    document.removeEventListener('pointerlockchange', pointerLockChange, false);
}

const disabled = ref(false);
const spare_tip = ref('');
const disable = () => {
    const shapes = props.manager.flat;
    if (shapes.length === 1) {
        const type = shapes[0].type;
        const fills = shapes[0].data.style.fills;
        if (type === ShapeType.Artboard && !isFill(fills)) {
            spare_tip.value = t('shadow.fill_is_visible');
            disabled.value = true;
        } else {
            if (type !== ShapeType.Rectangle && type !== ShapeType.Artboard && type !== ShapeType.Oval) {
                spare_tip.value = t('shadow.only_used');
                disabled.value = true;
            } else {
                spare_tip.value = t('shadow.extend');
                disabled.value = false;
            }
        }
    } else if (shapes.length > 1) {
        let artFills = false;
        let notAllArtboard = false;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.type !== ShapeType.Rectangle && shape.type !== ShapeType.Artboard && shape.type !== ShapeType.Oval) {
                spare_tip.value = t('shadow.only_used');
                return disabled.value = true;
            } else if (shape.type !== ShapeType.Artboard) {
                notAllArtboard = true;
            } else if (shape.type === ShapeType.Artboard && !isFill(shape.style.fills)) {
                artFills = true;
            }
        }
        if (notAllArtboard) {
            spare_tip.value = t('shadow.extend');
            disabled.value = false;
        } else {
            if (artFills) {
                spare_tip.value = t('shadow.fill_is_visible');
                disabled.value = true;
            } else {
                spare_tip.value = t('shadow.extend');
                disabled.value = false;
            }
        }
    }
}

const isFill = (fills: Fill[]) => {
    for (let i = 0; i < fills.length; i++) {
        const fill = fills[i];
        if (fill.isEnabled && fill.color.alpha > 0) return true;
    }
    return false;
}

function extend(base: number) {
    return Number(format_value(base));
}

const shadowsPicker = new ShadowColorPicker(props.context, FillType.SolidColor);

function update() {
    const data = props.data;
    const color = data.shadow.color;
    colorHex.value = toHex(color).slice(1);
    alpha.value = Math.round(color.alpha * 100) + '%';
    colors.value = [data.shadow.color] as Color[];
    shadowsPicker.shadow = data.shadow;

    rgba.value = { R: color.red, G: color.green, B: color.blue, A: color.alpha, position: 1 };
}

const stop1 = watchEffect(update);
onUnmounted(() => {
    stop1();
    panelStatusMgr.unmounted();
    colorPanelStatusMgr.unmounted();
});
</script>

<template>
    <div class="shadow-trigger" @click="showDetailPanel">
        <SvgIcon :icon="gear_icon" />
    </div>
    <div v-if="panelStatus.visible" id="shadow-detail-container">
        <PopoverHeader :title="t('shadow.shadow_setting')" :create="false" @close="panelStatusMgr.close()" />
        <div class="options-container">
            <div class="setting">
                <div class="name-title">{{ t('shadow.position') }}</div>
                <ShadowInput ticon="X" :shadow-v="extend(data.shadow.offsetX)" @on-change="setOffsetX"
                    @key-down="keydownOffsetX" @dragstart="dragStart" @dragging="draggingX" @dragend="dragEnd">
                </ShadowInput>
                <ShadowInput ticon="Y" :shadow-v="extend(data.shadow.offsetY)" @on-change="setOffsetY"
                    @key-down="keydownOffsetY" @dragstart="dragStart" @dragging="draggingY" @dragend="dragEnd">
                </ShadowInput>
            </div>
            <div class="setting">
                <div class="name-title">{{ t('shadow.effect') }}</div>
                <ShadowInput ticon="B" :shadow-v="extend(data.shadow.blurRadius)" @on-change="setBlurRadius"
                    :tootip="`${t('shadow.blur')}`" @key-down="keydownBlurRadius" @dragstart="dragStart"
                    @dragging="draggingB" @dragend="dragEnd">
                </ShadowInput>
                <ShadowInput ticon="S" :shadow-v="extend(data.shadow.spread)" @on-change="setSpread"
                    :disabled="disabled" :tootip="spare_tip" @dragstart="dragStart" @dragging="draggingS"
                    @dragend="dragEnd" @key-down="keydownSpread">
                </ShadowInput>
            </div>
            <div class="setting">
                <div class="name-title">{{ t('shadow.color') }}</div>
                <div :class="{ 'value-panel-wrapper': true }">
                    <ColorBlock :colors="(colors as Color[])" @click="showColorPanel" />
                    <input class="colorShadow" type="text" :value="colorHex" @focus="selectAllOnFocus"
                        @change="(e) => manager.modifyShadowHex(e, data.shadow)" />
                    <input class="alphaShadow" type="text" :value="alpha" @focus="selectAllOnFocus"
                        @change="(e) => manager.modifyShadowAlpha(e, data.shadow)" />
                </div>
                <ColorPicker v-if="colorPanelStatus.visible" :editor="shadowsPicker" :type="FillType.SolidColor"
                    :include="[]" :color="rgba" @close="() => colorPanelStatusMgr.close()" />
            </div>
        </div>
        <teleport to="body">
            <div v-if="tel" class="point" :style="{ top: `${telY - 10}px`, left: `${telX - 10.5}px` }" />
        </teleport>
    </div>
</template>

<style scoped lang="scss">
.shadow-trigger {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: var(--default-radius);

    >img {
        width: 16px;
        height: 16px;
    }
}

.shadow-trigger:hover {
    background-color: #F5F5F5;
}

#shadow-detail-container {
    width: 254px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 99;

    .options-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 12px 12px 0 12px;
        box-sizing: border-box;
        height: 100%;

        >div {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
    }
}

.setting {
    width: 100%;
    height: 32px;
    display: flex;
    box-sizing: border-box;
    align-items: center;

    .name-title {
        width: 24px;
        height: 14px;
        font-size: 12px;
        color: #737373;
        margin-right: 14px;
    }
}

.value-panel-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    flex: 1;
    height: 32px;
    padding: 0 8px;
    box-sizing: border-box;
    background-color: var(--input-background);
    border-radius: var(--default-radius);

    .colorShadow {
        flex: 1;
        width: 46px;
        outline: none;
        border: none;
        height: 14px;
        background-color: transparent;
        font-size: 12px;
        box-sizing: border-box;
    }

    .alphaShadow {
        width: 46px;
        outline: none;
        border: none;
        background-color: transparent;
        height: 14px;
        font-size: 12px;
        box-sizing: border-box;
        flex: 0 0 46px;
        text-align: right;
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