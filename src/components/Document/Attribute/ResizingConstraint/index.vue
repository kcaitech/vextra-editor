<script setup lang="ts">
import { Page, ResizingConstraints2, adapt2Shape } from '@kcdesign/data';
import { Context } from '@/context';
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Select, { SelectItem, SelectSource } from '@/components/common/Select2.vue';
import { genOptions } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import TypeHeader from '../TypeHeader.vue';
import { throttle } from 'lodash';

interface Props {
    context: Context;
    trigger: any[];
    selectionChange: number;
}
const { t } = useI18n();
const props = defineProps<Props>();
const mixed = t('attr.mixed');

const horizontalPositionSelected = ref<SelectItem>({ value: 'left', content: t('attr.fixed_left') });
const horizontalPositionOptions: SelectSource[] = genOptions([
    ['left', t('attr.fixed_left')],
    ['right', t('attr.fixed_right')],
    ['hcenter', t('attr.center')],
    ['lrfixed', t('attr.fixed_left_right')]
]);

const horizontalSizeSelected = ref<SelectItem>({ value: 'fixedWidth', content: t('attr.fixedWidth') });
const horizontalSizeOptions: SelectSource[] = genOptions([
    ['fixedWidth', t('attr.fixedWidth')],
    ['hfollow', t('attr.follow_container')]
]);

const VerticalPositionSelected = ref<SelectItem>({ value: 'top', content: t('attr.fixed_top') });
const VerticalPositionOptions: SelectSource[] = genOptions([
    ['top', t('attr.fixed_top')],
    ['bottom', t('attr.fixed_bottom')],
    ['vcenter', t('attr.center')],
    ['tbfixed', t('attr.fixed_top_bottom')],
]);

const VerticalSizeSelected = ref<SelectItem>({ value: 'fixedHeight', content: t('attr.fixedHeight') });
const VerticalSizeOptions: SelectSource[] = genOptions([
    ['fixedHeight', t('attr.fixedHeight')],
    ['vfollow', t('attr.follow_container')]
]);

function createEditor() {
    const page = props.context.selection.selectedPage!;
    return props.context.editor.editor4ResizingConstraint(adapt2Shape(page) as Page);
}

function handleHorizontalPositionSelect(item: SelectItem) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'left':
            e.fixedToLeft(selected);
            break;
        case 'right':
            e.fixedToRight(selected);
            break;
        case 'hcenter':
            e.HorizontaljustifyCenter(selected);
            break;
        case 'lrfixed':
            e.fixedToLR(selected);
            break;
        default:
            break;
    }
}

function handleHorizontalSizeSelect(item: SelectItem) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'fixedWidth':
            e.fixedToWidth(selected);
            break;
        case 'hfollow':
            e.flexWidth(selected);
            break;
        default:
            break;
    }
}

function handleVerticalPositionSelect(item: SelectItem) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'top':
            e.fixedToTop(selected);
            break;
        case 'bottom':
            e.fixedToBottom(selected);
            break;
        case 'vcenter':
            e.VerticaljustifyCenter(selected);
            break;
        case 'tbfixed':
            e.fixedToTB(selected);
            break;
        default:
            break;
    }
}

function handleVerticalSizeSelect(item: SelectItem) {
    const e = createEditor();
    const selected = props.context.selection.selectedShapes.map(s => adapt2Shape(s));
    switch (item.value) {
        case 'fixedHeight':
            e.fixedToHeight(selected);
            break;
        case 'vfollow':
            e.flexHeight(selected);
            break;
        default:
            break;
    }
}

const disabled = ref(false)

function _update() {
    modifyhorizontalPositionStatus();
    modifyverticalPositionStatus();
    modifyWidthStatus();
    modifyHeightStatus();
    disabled.value = props.context.selection.selectedShapes.some(item => item.isVirtualShape);
}

function modifyhorizontalPositionStatus() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            horizontalPositionSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint;
    if (rc === undefined) {
        rc = ResizingConstraints2.Mask;
    }

    if (ResizingConstraints2.isFixedLeftAndRight(rc)) {
        horizontalPositionSelected.value = { value: 'lrfixed', content: t('attr.fixed_left_right') };
    } else if (ResizingConstraints2.isFixedToLeft(rc)) {
        horizontalPositionSelected.value = { value: 'left', content: t('attr.fixed_left') };
    } else if (ResizingConstraints2.isFixedToRight(rc)) {
        horizontalPositionSelected.value = { value: 'right', content: t('attr.fixed_right') };
    } else if (ResizingConstraints2.isHorizontalJustifyCenter(rc)) {
        horizontalPositionSelected.value = { value: 'hcenter', content: t('attr.center') };
    }

    function getGroupVal(val: number) {
        return ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Left) + ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Right);
    }
}
function modifyWidthStatus() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            horizontalSizeSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint;
    if (rc === undefined) {
        rc = ResizingConstraints2.Mask;
    }

    if (ResizingConstraints2.isFixedWidth(rc)) {
        horizontalSizeSelected.value = { value: 'fixedWidth', content: t('attr.fixedWidth') };
    } else {
        horizontalSizeSelected.value = { value: 'hfollow', content: t('attr.follow_container') };
    }

    function getGroupVal(val: number) {
        return (ResizingConstraints2.Mask ^ val & ResizingConstraints2.Width);
    }
}

function modifyverticalPositionStatus() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            VerticalPositionSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint;
    if (rc === undefined) {
        rc = ResizingConstraints2.Mask;
    }

    if (ResizingConstraints2.isFixedTopAndBottom(rc)) {
        VerticalPositionSelected.value = { value: 'tbfixed', content: t('attr.fixed_top_bottom') };
    } else if (ResizingConstraints2.isFixedToTop(rc)) {
        VerticalPositionSelected.value = { value: 'top', content: t('attr.fixed_top') };
    } else if (ResizingConstraints2.isFixedToBottom(rc)) {
        VerticalPositionSelected.value = { value: 'bottom', content: t('attr.fixed_bottom') };
    } else if (ResizingConstraints2.isVerticalJustifyCenter(rc)) {
        VerticalPositionSelected.value = { value: 'vcenter', content: t('attr.center') };
    }

    function getGroupVal(val: number) {
        return ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Top) + ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Bottom);
    }
}
function modifyHeightStatus() {
    const shapes = props.context.selection.selectedShapes;
    if (!shapes.length) {
        return;
    }

    let commonRC = getGroupVal(shapes[0].resizingConstraint || 0);
    for (let i = 1, l = shapes.length; i < l; i++) {
        let __rc = getGroupVal(shapes[i].resizingConstraint || 0);
        if (__rc !== commonRC) {
            VerticalSizeSelected.value = { value: 'mixed', content: mixed };
            return;
        }
    }

    let rc = shapes[0].resizingConstraint;
    if (rc === undefined) {
        rc = ResizingConstraints2.Mask;
    }

    if (ResizingConstraints2.isFixedHeight(rc)) {
        VerticalSizeSelected.value = { value: 'fixedHeight', content: t('attr.fixedHeight') };
    } else {
        VerticalSizeSelected.value = { value: 'vfollow', content: t('attr.follow_container') };
    }

    function getGroupVal(val: number) {
        return (ResizingConstraints2.Mask ^ val & ResizingConstraints2.Height);
    }
}

const update = throttle(_update, 120);

// 这里在下代协作算法出来后可以优化
const stop = watch(() => props.trigger, update); // 监听图层变化
const stop2 = watch(() => props.selectionChange, update); // 监听选区变化

onMounted(update);
onUnmounted(() => {
    stop();
    stop2();
});
</script>
<template>
    <div class="wrap">
        <TypeHeader :title="t('attr.constraints')" class="mt-24" :active="!disabled">
        </TypeHeader>
        <div class="content" :class="{ 'disabled': disabled }">
            <div class="row">
                <label>{{ t('attr.horizontal') }}</label>
                <Select :selected="horizontalPositionSelected" :source="horizontalPositionOptions"
                    @select="handleHorizontalPositionSelect" :disabled="disabled"></Select>
                <Select :selected="horizontalSizeSelected" :source="horizontalSizeOptions"
                    @select="handleHorizontalSizeSelect" :disabled="disabled"></Select>
            </div>
            <div class="row">
                <label>{{ t('attr.vertical') }}</label>
                <Select :selected="VerticalPositionSelected" :source="VerticalPositionOptions"
                    @select="handleVerticalPositionSelect" :disabled="disabled"></Select>
                <Select :selected="VerticalSizeSelected" :source="VerticalSizeOptions" @select="handleVerticalSizeSelect"
                    :disabled="disabled"></Select>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.disabled {
    opacity: 0.4;
    z-index: -1;
}

.wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px 18px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .content>.row {
        width: 100%;
        display: flex;
        align-content: center;
        justify-content: space-between;
        margin-bottom: 12px;

        >label {
            flex: 0 0 42px;
            line-height: 32px;
        }

        >.select-container {
            flex: 0 1 84px;
            height: 32px;
        }
    }
}
</style>