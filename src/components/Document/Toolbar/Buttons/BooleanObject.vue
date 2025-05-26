/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { Selection } from '@/context/selection';
import { Context } from '@/context';
import ToolButton from './ToolButton.vue';
import DropSelect from "./DropSelect.vue"
import { BoolOp, BoolShapeView, ShapeType, ShapeView } from '@kcdesign/data';
import { useI18n } from 'vue-i18n'
import { message } from '@/utils/message';
import SvgIcon from '@/components/common/SvgIcon.vue';

const { t } = useI18n()
const props = defineProps<{ context: Context, disabled: boolean }>();
type Button = InstanceType<typeof ToolButton>

const popoverVisible = ref<boolean>(false);
const popover = ref<HTMLDivElement>();
const button = ref<Button>();
const visible = ref(false)
const selectBool = ref('union')
const boolType = ref(BoolOp.Union)
const boolName = ref('union')
const state = ref(false)
const emit = defineEmits<{
    (e: "changeBool", type: BoolOp, name: string): void;
    (e: 'flattenShape'): void;
}>();

const patterns = ((items: [string, any, BoolOp][]) => (items.map(item => ({
    value: item[0],
    content: item[1],
    bool: item[2]
}))))([
    ['union', 'union', BoolOp.Union],
    ['subtract', 'subtract', BoolOp.Subtract],
    ['intersection', 'intersection', BoolOp.Intersect],
    ['difference', 'difference', BoolOp.Diff],
    ['cohere', 'cohere', BoolOp.None]
]);

function showMenu(e: MouseEvent) {
    const selected = props.context.selection.selectedShapes;
    if (selected.length > 0 && selected.some(s => s.type === ShapeType.Cutout)) {
        return message('feature', t('cutoutExport.cutoutNotBool'));
    }
    if (popoverVisible.value) return popoverVisible.value = false;
    if (button.value?.toolButtonEl) {
        const el = button.value?.toolButtonEl;
        visible.value = false
        popoverVisible.value = true;
        nextTick(() => {
            if (popover.value) {
                popover.value.style.left = el.offsetLeft + 'px';
                popover.value.style.top = el.offsetHeight + 13 + 'px';
            }
        })
    }
}

const selector = (active: string, type: BoolOp) => {
    if (active !== 'cohere') {
        selectBool.value = active
    }
    boolType.value = type
    popoverVisible.value = false;
    boolName.value = active
    if (active === 'cohere') {
        emit('flattenShape')
    } else {
        emit('changeBool', type, boolName.value);
    }
}

function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover, .menu')) popoverVisible.value = false;
}

var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer)
    visible.value = false
}

const changeBool = () => {
    const selected = props.context.selection.selectedShapes;
    if (selected.length > 0 && selected.some(s => s.type === ShapeType.Cutout)) {
        message('info', t('cutoutExport.cutoutNotBool'));
        return;
    }
    emit('changeBool', boolType.value, boolName.value);
}

const selectionWatch = (t?: number | string) => {
    if (t === Selection.CHANGE_SHAPE) {
        const shapes = props.context.selection.selectedShapes
        getBoolGroupType(shapes)
    }
}

const getBoolGroupType = (shapes: ShapeView[]) => {
    if (shapes.length === 1 && shapes[0].type === ShapeType.BoolShape) {
        const type = (shapes[0] as BoolShapeView).getBoolOp()
        if (type.op === 'union') {
            selectBool.value = 'union'
            boolType.value = BoolOp.Union
        } else if (type.op === 'subtract') {
            selectBool.value = 'subtract'
            boolType.value = BoolOp.Subtract
        } else if (type.op === 'intersect') {
            selectBool.value = 'intersection'
            boolType.value = BoolOp.Intersect
        } else if (type.op === 'diff') {
            selectBool.value = 'difference'
            boolType.value = BoolOp.Diff
        }
        if (type.op === 'none') {
            state.value = true
        } else {
            state.value = false
            boolName.value = selectBool.value
        }
    } else if (shapes.length > 1) {
        selectBool.value = 'union';
        state.value = true
        boolName.value = 'union'
        boolType.value = BoolOp.Union
    } else {
        selectBool.value = 'union';
        state.value = false
        boolName.value = 'union'
        boolType.value = BoolOp.Union
    }

}

const stop = watch(() => props.disabled, (d) => {
    if (d) {
        popoverVisible.value = false;
    }
})

const stop2 = watch(() => popoverVisible.value, (v) => {
    if (v) {
        document.addEventListener('click', onMenuBlur);
    } else {
        document.removeEventListener('click', onMenuBlur);
    }
})

onMounted(() => {
    const shapes = props.context.selection.selectedShapes
    getBoolGroupType(shapes)
    props.context.selection.watch(selectionWatch)
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionWatch)
    stop();
    document.removeEventListener('click', onMenuBlur);
    stop2();
})
import white_down_icon from '@/assets/icons/svg/white-down.svg'
import union_icon from '@/assets/icons/svg/union.svg'
import subtract_icon from '@/assets/icons/svg/subtract.svg'
import intersection_icon from '@/assets/icons/svg/intersection.svg'
import difference_icon from '@/assets/icons/svg/difference.svg'

function boolIcon() {
    switch (selectBool.value) {
        case 'union':
            return union_icon
        case 'subtract':
            return subtract_icon
        case 'intersection':
            return intersection_icon
        case 'difference':
            return difference_icon
        default:
            return union_icon
    }
}

</script>

<template>
    <div ref="popover" class="popover" tabindex="-1" v-if="popoverVisible">
        <template v-for="(item, index) in patterns" :key="item.value">
            <div class="line" v-if="index === 4"/>
            <DropSelect @selectBool="selector" :lg="item.value" :select="item.content" :bool="item.bool" type="bool"
                        :d="selectBool" :state="state"/>
        </template>
    </div>
    <el-tooltip class="box-item" effect="dark" :content="t(`bool.${selectBool}`)" placement="bottom" :show-after="600"
        :offset="10" :hide-after="0" :visible="popoverVisible ? false : visible">
        <ToolButton :class="{'active-f':popoverVisible}" ref="button"
            :style="{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }" :selected="false"
            @mouseenter.stop="onMouseenter" @mouseleave.stop="onMouseleave">
            <div class="svg-container" :class="{ active: state }" @click="changeBool">
                <SvgIcon :icon="boolIcon()"/>
            </div>
            <div class="menu" @click="showMenu">
                <SvgIcon :icon="white_down_icon"/>
            </div>
        </ToolButton>
    </el-tooltip>
</template>

<style lang="scss" scoped>
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 4px;
    color: #ffffff;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

    >img {
        width: 18px;
        height: 18px;
    }
}

.active {
    color: gray;
}

.active-f{
    background-color: rgba(255, 255, 255, .1);
}

.menu {
    width: 20px;
    height: 28px;
    display: flex;
    //padding-right: 4px;
    //margin-right: 2px;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    transition: 0.3s;
    padding: 10px 8px 10px 0;
    box-sizing: border-box;

    >svg {
        width: 12px;
        height: 12px;
    }
}

.menu:hover {
    transform: translateY(4px);
}

.popover {
    position: absolute;
    z-index: 999;
    width: 180px;
    height: auto;
    background-color: var(--theme-color);
    border-radius: 4px;
    outline: none;
    padding: var(--default-padding-half) 0;

    .line {
        width: 100%;
        height: 11px;
        border-width: 5px 0 5px 0;
        border-style: solid;
        border-color: var(--theme-color);
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, .5)
    }
}
</style>