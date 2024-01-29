<script setup lang="ts">
import { Page, ShapeView, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import { Selection } from '@/context/selection';

interface Props {
    context: Context
    shapes: ShapeView[]
}
const { t } = useI18n();
const props = defineProps<Props>();
const horizontal_position = ref<boolean>(true);
const vertical_position = ref<boolean>(true);
const checked1 = ref(false)
const checked2 = ref(false)
const showvalue = ref(false)
const horizontalSelected = ref<SelectItem>({ value: 'left', content: t('attr.fixed_left') });
const horizontalOptions: SelectSource[] = genOptions([
    ['left', t('attr.fixed_left')],
    ['right', t('attr.fixed_right')],
    ['hcenter', t('attr.center')],
    ['lrfixed', t('attr.fixed_left_right')],
    ['hfollow', t('attr.follow_container')]
]);

const verticalSelected = ref<SelectItem>({ value: 'top', content: t('attr.fixed_top') });
const verticalOptions: SelectSource[] = genOptions([
    ['top', t('attr.fixed_top')],
    ['bottom', t('attr.fixed_bottom')],
    ['vcenter', t('attr.center')],
    ['tbfixed', t('attr.fixed_top_bottom')],
    ['vfollow', t('attr.follow_container')]
]);

const state = ref<number>(0);
type Side = 'left' | 'right' | 'hcenter' | 'lrfixed' | 'hfollow' | 'top' | 'bottom' | 'vcenter' | 'tbfixed' | 'vfollow';
enum Codes1 {
    Left = 1,
    Right = 2,
    HCenter = 4,
    LRFixed = 8,
    HFollow = 16,
}
enum Codes2 {
    Top = 1,
    Bottom = 2,
    VCenter = 4,
    TBFixed = 8,
    VFollow = 16,
}
interface Controller {
    left: boolean;
    right: boolean;
    hcenter: boolean;
    lrfixed: boolean;
    follow: boolean;
    top: boolean;
    bottom: boolean;
    vcenter: boolean;
    tbfixed: boolean
}
const controller: Controller = reactive({
    left: false,
    right: false,
    hcenter: false,
    lrfixed: false,
    follow: false,
    top: false,
    bottom: false,
    vcenter: false,
    tbfixed: false,
});
function horizontalJudgment() {
    controller.left = Boolean((~state.value & Codes1.Left));
    controller.right = Boolean((~state.value & Codes1.Right));
    controller.hcenter = Boolean((~state.value & Codes1.HCenter));
    controller.lrfixed = Boolean((~state.value & Codes1.LRFixed));
    controller.follow = Boolean((~state.value & Codes1.HFollow));
}
function verticalJudgment() {
    controller.top = Boolean((~state.value & Codes2.Top));
    controller.bottom = Boolean((~state.value & Codes2.Bottom));
    controller.vcenter = Boolean((~state.value & Codes2.VCenter));
    controller.tbfixed = Boolean((~state.value & Codes2.TBFixed));
    controller.follow = Boolean((~state.value & Codes2.VFollow));
}
//更新水平状态
function horizontalChange(side: Side) {
    const page = props.context.selection.selectedPage!
    const shapes = props.context.selection.selectedShapes
    const setconstraint = props.context.editor.editor4ResizingConstraint(adapt2Shape(page) as Page)

    switch (side) {
        case 'left':
            setconstraint.fixedToLeft((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            console.log('左固定');
            break;
        case 'right':
            setconstraint.fixedToRight((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            console.log('右固定');
            break;
        case 'hcenter':
            state.value |= Codes1.HCenter;
            break;
        case 'lrfixed':
            setconstraint.fixedToWidth((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            console.log('宽度固定');
            break;
        case 'hfollow':
            state.value |= Codes1.HFollow;
            break;
        default:
            break;
    }

}
function horizontalSelect(selected: SelectItem) {
    console.log(selected.value);
    horizontalChange(selected.value as Side)
    horizontalSelected.value = selected;

}
//更新垂直状态
function verticalChange(side: Side) {
    const page = props.context.selection.selectedPage!
    const shapes = props.context.selection.selectedShapes
    const setconstraint = props.context.editor.editor4ResizingConstraint(adapt2Shape(page) as Page)
    switch (side) {
        case 'top':
            setconstraint.fixedToTop((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            console.log('顶部固定');
            break;
        case 'bottom':
            setconstraint.fixedToBottom((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            console.log('底部固定');
            break;
        case 'vcenter':
            state.value |= Codes2.VCenter;
            break;
        case 'tbfixed':
            setconstraint.fixedTHeight((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            console.log('高度固定');
            break;
        case 'vfollow':
            setconstraint.fixedTHeight((shapes as ShapeView[]).map(s => adapt2Shape(s)), true)
            break;
        default:
            break;
    }

}
function verticalSelect(selected: SelectItem) {
    verticalChange(selected.value as Side)
    verticalSelected.value = selected;
}

function fix_width() {
    checked1.value = !checked1.value
}
function fix_height() {
    checked2.value = !checked2.value
}

function updateSelectedOptions(shapes: ShapeView[]) {
    if (shapes.length === 1) {
        if (horizontalOptions.findIndex(item => item.id === 5) !== -1) {
            horizontalOptions.splice(0, 1)
        }
        if (verticalOptions.findIndex(item => item.id === 5) !== -1) {
            verticalOptions.splice(0, 1)
        }
    } else {
        if (horizontalOptions.findIndex(item => item.id === 5) === -1) {
            horizontalOptions.unshift({ id: 5, data: { value: 'duo', content: '多值' } })
        }
        if (verticalOptions.findIndex(item => item.id === 5) === -1) {
            verticalOptions.unshift({ id: 5, data: { value: 'duo', content: '多值' } })
        }
    }
}


function update() {
    console.log('更新了对象');
    const shapes = props.context.selection.selectedShapes
    updateSelectedOptions(shapes)
    if (!shapes.length) return;
    let firstConstraint = shapes[0].resizingConstraint as number
    firstConstraint = firstConstraint === undefined ? 63 : firstConstraint;
    let difference = firstConstraint;
    for (let i = 1; i < shapes.length; i++) {
        const value = shapes[i].resizingConstraint
        const randomConstraint = value === undefined ? 63 : value;
        difference = difference & randomConstraint
    }

    if (firstConstraint !== difference) {
        console.log(difference);
        showHorizontalSelected(difference)
        showVerticalSelected(difference)
    }

    if (firstConstraint === difference) {
        if (difference === 63) {
            showHorizontalSelected(-1)
            showVerticalSelected(-1)
        } else {
            const number = [1, 2, 4, 8, 16, 32]
            let arr = [] as number[]
            number.forEach(val => {
                if ((difference & val) == val) {
                    arr.push(val)
                }
            })
            console.log(arr);
            showHorizontalSelected(arr[0])
            showVerticalSelected(arr[1])
        }
    }

    function showHorizontalSelected(value: number) {
        switch (value) {
            case 0:
                horizontalSelected.value = { value: 'hcenter', content: t('attr.center') }
                break;
            case 1:
                horizontalSelected.value = { value: 'right', content: t('attr.fixed_right') }
                break;
            case 2:
                checked1.value = true
                horizontalSelected.value = { value: 'lrfixed', content: t('attr.fixed_left_right') }
                break;
            case 4:
                horizontalSelected.value = { value: 'left', content: t('attr.fixed_left') }
                break;
            default:
                horizontalSelected.value = { value: 'hfollow', content: t('attr.follow_container') }
                break;
        }
    }
    function showVerticalSelected(value: number) {
        switch (value) {
            case 0:
                horizontalSelected.value = { value: 'vcenter', content: t('attr.center') }
                break;
            case 8:
                verticalSelected.value = { value: 'bottom', content: t('attr.fixed_bottom') }
                break;
            case 16:
                checked2.value = true
                verticalSelected.value = { value: 'tbfixed', content: t('attr.fixed_top_bottom') }
                break;
            case 32:
                verticalSelected.value = { value: 'top', content: t('attr.fixed_top') }
                break;
            default:
                verticalSelected.value = { value: 'vfollow', content: t('attr.follow_container') }
                break;
        }
    }
}


function selection_watcher(t: Number) {
    if (t !== Selection.CHANGE_SHAPE) return
    update();
    watch_shapes()
}

const watchedShapes = new Map();

function watch_shapes() {
    watchedShapes.forEach((v, k) => {
        v.unwatch(update);
        watchedShapes.delete(k);
    })
    const selectedShapes = props.context.selection.selectedShapes;
    if (selectedShapes.length > 0) {
        const first = selectedShapes[0];
        watchedShapes.set(first.id, first);
        watchedShapes.forEach((v) => { v.watch(update); });
    }
}

onMounted(() => {
    props.context.selection.watch(selection_watcher);
    update();
    watch_shapes();

})

onUnmounted(() => {
    props.context.selection.unwatch(selection_watcher);
})
</script>
<template>
    <div class="wrap">
        <div class="title">
            <span>{{ t('attr.groupings') }}</span>
        </div>
        <div v-if="horizontal_position" class="horizontal-container">
            <label>{{ t('attr.horizontal') }}</label>
            <Select :selected="horizontalSelected" :source="horizontalOptions" @select="horizontalSelect"></Select>
            <div class="checkbox">
                <div :class="checked1 ? 'visibility' : 'hidden'" @click="fix_width">
                    <svg-icon v-if="checked1" icon-class="select"></svg-icon>
                </div>
            </div>
            <div class="word"><span>{{ t('attr.fixedWidth') }}</span></div>
        </div>
        <div v-if="vertical_position" class="vertical-container">
            <label>{{ t('attr.vertical') }}</label>
            <Select :selected="verticalSelected" :source="verticalOptions" @select="verticalSelect"></Select>
            <div class="checkbox">
                <div :class="checked2 ? 'visibility' : 'hidden'" @click="fix_height">
                    <svg-icon v-if="checked2" icon-class="select"></svg-icon>
                </div>
            </div>
            <div class="word"><span>{{ t('attr.fixedHeight') }}</span></div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.wrap {
    width: 100%;
    padding: 20px 8px 12px 8px;
    border-bottom: 1px solid #F0F0F0;
    box-sizing: border-box;

    .title span {
        font-weight: 500;
        line-height: 44px;
    }

    .horizontal-container,
    .vertical-container {
        display: flex;
        align-items: center;
        line-height: 32px;
        margin-bottom: 12px;

        label {
            white-space: nowrap;
        }

        .word {
            margin-top: -2px;
            margin-left: 5px;
        }

        .checkbox {
            margin-left: -2px;

            .visibility {
                flex: 0 0 18px;
                height: 13px;
                width: 13px;
                margin-left: 8px;
                background-color: var(--active-color);
                border-radius: var(--default-radius);
                border: 1px solid var(--input-background);
                box-sizing: border-box;
                color: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;

                >svg {
                    width: 60%;
                    height: 60%;
                }
            }

            .hidden {
                flex: 0 0 18px;
                height: 13px;
                width: 13px;
                margin-left: 8px;
                background-color: transparent;
                border-radius: var(--default-radius);
                border: 1px solid var(--input-background);
                box-sizing: border-box;
            }
        }

    }
}
</style>