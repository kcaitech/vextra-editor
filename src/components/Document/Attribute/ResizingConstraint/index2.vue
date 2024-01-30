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
            e.justifyCenter(selected);
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

// todo vertical
// ...

function _update() {
    modifyhorizontalPositionStatus();
    modifyWidthStatus();
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
    } else if (ResizingConstraints2.isJustifyCenter(rc)) {
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
        return ((ResizingConstraints2.Mask ^ val) & ResizingConstraints2.Width);
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
        <TypeHeader :title="t('attr.constraints')" class="mt-24" :active="true">
        </TypeHeader>
        <div class="row">
            <label>{{ t('attr.horizontal') }}</label>
            <Select :selected="horizontalPositionSelected" :source="horizontalPositionOptions"
                @select="handleHorizontalPositionSelect"></Select>
            <Select :selected="horizontalSizeSelected" :source="horizontalSizeOptions"
                @select="handleHorizontalSizeSelect"></Select>
        </div>
        <div class="row">
            <!-- todo vertical -->
        </div>
    </div>
</template>

<style scoped lang="scss">
.wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px 18px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    >.row {
        width: 100%;
        display: flex;
        align-content: center;
        justify-content: space-between;

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