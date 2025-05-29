/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from '@/context';
import BorderCustomInput from './BorderCustomInput.vue';
import { LinearApi, ShapeView, SideType } from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { Selection } from '@/context/selection';
import { hidden_selection } from '@/utils/content';
import { useI18n } from 'vue-i18n';
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
import { customizable, getSideSettingType, getThickness, StrokeFillContextMgr } from '../ctx';
import { LockedPointer } from "@/components/Document/Attribute/LockedPointer/lockedpointer";
import { verifiedVal } from "@/components/common/ColorPicker/utils";

const { t } = useI18n();

const props = defineProps<{
    context: Context
    manager: StrokeFillContextMgr
    trigger: any[]
}>();
const emits = defineEmits<{
    (e: 'repositioning'): void;
}>();
const sideType = ref<SideType>();
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
    if (!flat.length) return;

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

function setSideThickness(thickness: number, type: SideType) {
    props.manager.modifyBorderCustomThickness(getFlat(), thickness, type);
}

function keydownThickness(e: KeyboardEvent, val: string | number, type: SideType) {
    if (getFlat().length === 0) return;
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

const locker = new LockedPointer();
let lockMouse: LockMouse | undefined = undefined;
let draggingType: SideType = SideType.Normal;

function dragStart(event: MouseEvent, type: SideType) {
    draggingType = type;
    lockMouse = new LockMouse(props.context, event);

    locker.start(event, (event: MouseEvent) => {
        if (!lockMouse) return;
        if (!lockMouse.asyncApiCaller) lockMouse.createApiCaller('translating');
        const tNow = getThicknessByDraggingType();
        if (typeof tNow === 'string') return;
        const val = verifiedVal(tNow + event.movementX, 0, 300);
        lockMouse.modifyBorderCustomThickness(getFlat(), val, type);
    }, () => {
        lockMouse?.fulfil();
        lockMouse = undefined;
    })

    function getThicknessByDraggingType(): string | number {
        switch (draggingType) {
            case SideType.Left:
                return leftThickness.value;
            case SideType.Right:
                return rightThickness.value;
            case SideType.Top:
                return topThickness.value;
            case SideType.Bottom:
                return bottomThickness.value;
            default:
                return leftThickness.value;
        }
    }
}

const watchList: any[] = [
    watch(() => props.trigger, (v) => {
        if (v?.includes('bordersMask') || v?.includes('borders') || v?.includes('variables')) update();
        if (v?.includes('haveEdit')) flat = undefined;
    }),
    watch(() => sideType.value, (v, o) => {
        if (v === SideType.Custom || o === SideType.Custom) emits("repositioning");
    }),
    props.context.selection.watch((t?: any) => {
        if (t === Selection.CHANGE_SHAPE) {
            flat = undefined;
            update();
        }
    })
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
                <BorderCustomInput icon="top" :value="topThickness"
                                   @change="(v) => setSideThickness(v, SideType.Top)"
                                   @dragstart="(e) => dragStart(e, SideType.Top)"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Top)"/>
                <BorderCustomInput icon="bottom" :value="bottomThickness"
                                   @change="(v) => setSideThickness(v, SideType.Bottom)"
                                   @dragstart="(e) => dragStart(e, SideType.Bottom)"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Bottom)"/>
            </div>
        </div>
        <div v-if="sideType === SideType.Custom" class="border-style" style="margin-top: 6px;">
            <div class="border"></div>
            <div class="border-custom">
                <BorderCustomInput icon="left" :value="leftThickness"
                                   @change="(v) => setSideThickness(v, SideType.Left)"
                                   @dragstart="(e) => dragStart(e,  SideType.Left)"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Left)"/>
                <BorderCustomInput icon="right" :value="rightThickness"
                                   @change="(v) => setSideThickness(v, SideType.Right)"
                                   @dragstart="(e) => dragStart(e, SideType.Right)"
                                   @keydown="(e, val) => keydownThickness(e, val, SideType.Right)"/>
            </div>
        </div>
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
</style>