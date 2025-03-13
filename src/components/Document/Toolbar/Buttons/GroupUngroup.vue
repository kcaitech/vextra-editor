/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Selection } from '@/context/selection';
import {
    adapt2Shape,
    ArtboardView,
    BoolOp,
    BoolShapeView,
    GroupShape,
    GroupShapeView,
    Shape,
    ShapeType,
    ShapeView
} from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { flattenSelection, getName } from '@/utils/content';
import { debounce } from 'lodash';
import { compare_layer_3, filter_for_group1 } from '@/utils/group_ungroup';
import BooleanObject from "./BooleanObject.vue"
import { Tool } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';

const { t } = useI18n();
const props = defineProps<{ context: Context, params: any }>();
const isBoolGroup = ref(false)
const isUngroup = ref(false);
const isGroup = ref(false);

const _updater = () => {
    const selection = props.context.selection;
    const shapes = selection.selectedShapes;
    isBoolGroup.value = false;
    isUngroup.value = false;
    isGroup.value = false;
    if (shapes.length === 1) {
        const type = shapes[0].type;
        if (type === ShapeType.Group || type === ShapeType.BoolShape) {
            isBoolGroup.value = true;
            isUngroup.value = true;
        }
        isGroup.value = true;
    } else if (shapes.length > 1) {
        isBoolGroup.value = true;
        isGroup.value = true;
        if (shapes.some(s => s.type === ShapeType.Artboard || s.type === ShapeType.Symbol || s.type === ShapeType.SymbolRef || s.type === ShapeType.SymbolUnion)) {
            isBoolGroup.value = false;
        }
    }
}

const updater = debounce(_updater, 50);

function selectedWatcher(t?: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        updater();
    }
}

function tool_watcher(t?: number, alt?: boolean) {
    if (t === Tool.GROUP) {
        groupClick(alt);
    } else if (t === Tool.UNGROUP) {
        ungroupClick();
    }
}

const groupClick = (alt?: boolean) => {
    props.context.workspace.setSelectionViewUpdater(false);
    const selection = props.context.selection;
    let shapes = filter_for_group1(selection.selectedShapes);
    const page = selection.selectedPage;
    if (!page || !shapes.length) return;
    const bro = Array.from(page.shapes.values());
    const editor = props.context.editor4Page(page);
    shapes = compare_layer_3(shapes);
    let newshape: Shape | false;
    if (alt) {
        const name = getName(ShapeType.Artboard, bro || [], t);
        newshape = editor.create_artboard(shapes, name);
    } else {
        const name = getName(ShapeType.Group, bro || [], t);
        newshape = editor.group(shapes, name);
    }
    if (newshape) {
        props.context.nextTick(page, () => {
            const group = newshape && page.getShape(newshape.id);
            group && props.context.selection.selectShape(group);
            group && props.context.selection.notify(Selection.EXTEND, group);
        })
    }
    props.context.workspace.setSelectionViewUpdater(true);
    props.context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
}
const ungroupClick = () => {
    const selection = props.context.selection;
    const shapes = selection.selectedShapes;
    if (!shapes.length) return;
    const groups = shapes.filter(i => (i.type === ShapeType.Group || i.type === ShapeType.BoolShape));
    const boards = shapes.filter(i => i.type === ShapeType.Artboard);
    const others: (ShapeView | Shape)[] = shapes.filter(i => i.type !== ShapeType.Group && i.type !== ShapeType.Artboard && i.type !== ShapeType.BoolShape);
    const page = selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    if (boards.length) {
        const a = editor.dissolution_artboard(boards as ArtboardView[]);
        if (a) others.push(...a);
    }
    if (groups.length) {
        const g = editor.ungroup(groups as GroupShapeView[]);
        if (g) others.push(...g);
    }
    if (others.length) {
        props.context.nextTick(page, () => {
            const select = others.reduce((pre, cur) => {
                if (cur instanceof ShapeView) pre.push(cur);
                else {
                    const c = page.getShape(cur.id);
                    if (c) pre.push(c);
                }
                return pre;
            }, [] as ShapeView[])
            selection.rangeSelectShape(select);
        })
    } else {
        selection.resetSelectShapes();
    }
}
/**
 * @description 布尔操作
 */
const changeBoolGroup = (type: BoolOp, n: string) => {
    const selection = props.context.selection;
    const shapes = selection.selectedShapes;
    const page = props.context.selection.selectedPage;

    const name = t(`bool.${n}`)
    if (shapes.length && page) {
        if (shapes.length === 1) {
            if (shapes[0] instanceof BoolShapeView) {
                const editor = props.context.editor4Shape(shapes[0])
                editor.setBoolOp(type, name)
            } else if (shapes[0] instanceof GroupShapeView) {
                const editor = props.context.editor4Page(page);
                editor.boolgroup2(adapt2Shape(shapes[0]) as GroupShape, name, type)
            }
        } else if (shapes.length > 1) {
            const shapessorted = compare_layer_3(filter_for_group1(shapes));
            const editor = props.context.editor4Page(page)
            editor.boolgroup(shapessorted.map(s => adapt2Shape(s)), name, type)
        }
    }
}
/**
 * @description 路径拼合
 */
const flattenShape = () => {
    flattenSelection(props.context);
}

onMounted(() => {
    _updater();
    props.context.tool.watch(tool_watcher)
    props.context.selection.watch(selectedWatcher);
})
onUnmounted(() => {
    props.context.selection.unwatch(selectedWatcher);
    props.context.tool.unwatch(tool_watcher)
})
</script>

<template>

    <BooleanObject :context="context" @changeBool="changeBoolGroup" @flatten-shape="flattenShape"
        :disabled="!isBoolGroup"></BooleanObject>

</template>

<style scoped lang="scss">
.container {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;

    .group {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 100%;
        width: 34.5px;

        >div {
            height: 32px;
            width: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: gray;
            transition: 0.1s;
            margin: 0;
            padding: 0;

            >svg {
                height: 18px;
                width: 18px;
            }
        }

        >.active {
            color: #ffffff;
        }
    }

    .vertical-line {
        width: 1px;
        height: 20px;
        background-color: grey;
        flex: 0 0 auto;
        margin-left: 5px;
        margin-right: 5px;
    }
}
</style>