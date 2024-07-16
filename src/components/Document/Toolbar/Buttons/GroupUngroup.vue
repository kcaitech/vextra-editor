<script setup lang="ts">
import { Selection } from '@/context/selection';
import {
    adapt2Shape,
    Artboard,
    BoolOp,
    BoolShape,
    BoolShapeView,
    GroupShape,
    GroupShapeView,
    Shape,
    ShapeType,
    ShapeView
} from '@kcdesign/data';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { getName } from '@/utils/content';
import { debounce } from 'lodash';
import { compare_layer_3, filter_for_group1 } from '@/utils/group_ungroup';
import BooleanObject from "./BooleanObject.vue"
import { Tool } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';

const { t } = useI18n();
const props = defineProps<{ context: Context, params: any }>();
const NOGROUP = 0;
const GROUP = 1;
const UNGROUP = 2;
const isBoolGroup = ref(false)
const state = ref(0);
const isUngroup = ref(false);
const isGroup = ref(false);

function _updater(t?: number | string) {
    if (t === Selection.CHANGE_SHAPE) {
        state.value = 0;
        const selection = props.context.selection;
        const shapes = selection.selectedShapes;
        isBoolGroup.value = false;
        isUngroup.value = false;
        isGroup.value = false;
        if (shapes.length === 0) {
            state.value = state.value ^ NOGROUP;
        } else if (shapes.length === 1) {
            const type = shapes[0].type;
            if (type === ShapeType.Group || type === ShapeType.BoolShape) {
                isBoolGroup.value = true;
                isUngroup.value = true;
            }
            isGroup.value = true;
            if (type === ShapeType.Group || type === ShapeType.Artboard || type === ShapeType.BoolShape) {
                state.value = state.value ^ UNGROUP ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        } else {
            isBoolGroup.value = true;
            isGroup.value = true;
            const groups = shapes.filter(s => s.type === ShapeType.Group || s.type === ShapeType.Artboard || s.type === ShapeType.BoolShape);
            if (groups.length) {
                state.value = state.value ^ UNGROUP ^ GROUP;
                isUngroup.value = true;
            } else {
                state.value = state.value ^ GROUP;
            }
            if (shapes.some(s => s.type === ShapeType.Artboard || s.type === ShapeType.Symbol || s.type === ShapeType.SymbolRef || s.type === ShapeType.SymbolUnion)) {
                isBoolGroup.value = false;
            }
        }
    }
}

const updater = debounce(_updater, 50);

function tool_watcher(t?: number, alt?: boolean) {
    if (t === Tool.GROUP) {
        groupClick(alt);
    } else if (t === Tool.UNGROUP) {
        ungroupClick();
    }
}

onMounted(() => {
    props.context.tool.watch(tool_watcher)
    props.context.selection.watch(updater);
    updater();
})
onUnmounted(() => {
    props.context.selection.unwatch(updater);
    props.context.tool.unwatch(tool_watcher)
})

const groupClick = (alt?: boolean) => {
    if (!(state.value & GROUP)) return;
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
        newshape = editor.create_artboard(shapes.map(s => adapt2Shape(s)), name);
    } else {
        const name = getName(ShapeType.Group, bro || [], t);
        newshape = editor.group(shapes.map(s => adapt2Shape(s)), name);
    }
    if (newshape) {
        props.context.nextTick(page, () => {
            const group = newshape && page.getShape(newshape.id);
            group && props.context.selection.selectShape(group);
            group && props.context.selection.notify(Selection.EXTEND, group);
        })
        state.value = 0;
        state.value = state.value ^ UNGROUP ^ GROUP;
    }
    props.context.workspace.setSelectionViewUpdater(true);
    props.context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
}
const ungroupClick = () => {
    if (!(state.value & UNGROUP)) {
        return;
    }
    const selection = props.context.selection;
    const shapes = selection.selectedShapes;
    if (!shapes.length) {
        return;
    }
    const groups = shapes.filter(i => (i.type === ShapeType.Group || i.type === ShapeType.BoolShape));
    const artboards = shapes.filter(i => i.type === ShapeType.Artboard);
    const others: (ShapeView | Shape)[] = shapes.filter(i => i.type !== ShapeType.Group && i.type !== ShapeType.Artboard && i.type !== ShapeType.BoolShape);
    const page = selection.selectedPage!;

    const editor = props.context.editor4Page(page);
    if (artboards.length) {
        const a = editor.dissolution_artboard(artboards.map(s => adapt2Shape(s)) as Artboard[]);
        if (a) others.push(...a);
    }
    if (groups.length) {
        const g = editor.ungroup(groups.map(s => adapt2Shape(s)) as GroupShape[]);
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
const changeBoolgroup = (type: BoolOp, n: string) => {
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
    const page = props.context.selection.selectedPage;
    const selection = props.context.selection;
    const shapes = compare_layer_3(filter_for_group1(selection.selectedShapes));
    if (page && shapes.length) {
        const editor = props.context.editor4Page(page)
        if (shapes.length === 1 && (shapes[0] instanceof BoolShapeView || shapes[0].type === ShapeType.Group)) {
            if (shapes[0].type === ShapeType.Group) {
                const editor = props.context.editor4Page(page);
                const bool = editor.boolgroup2(adapt2Shape(shapes[0]) as GroupShape, shapes[0].name, BoolOp.Union);
                nextTick(() => {
                    if (bool) {
                        const flatten = editor.flattenBoolShape(adapt2Shape(shapes[0]) as BoolShape)
                        if (flatten) {
                            props.context.nextTick(page, () => {
                                const s = page.getShape(flatten.id);
                                props.context.selection.selectShape(s)
                            })
                        }
                    }
                })
            } else {
                const flatten = editor.flattenBoolShape(adapt2Shape(shapes[0]) as BoolShape)
                if (flatten) {
                    props.context.nextTick(page, () => {
                        const s = page.getShape(flatten.id);
                        props.context.selection.selectShape(s)
                    })
                }
            }
        } else if (shapes.length > 1) {
            const shapessorted = compare_layer_3(shapes);
            const flatten = editor.flattenShapes(shapessorted.map(s => adapt2Shape(s)))
            if (flatten) {
                props.context.nextTick(page, () => {
                    const s = page.getShape(flatten.id);
                    props.context.selection.selectShape(s)
                })
            }
        }
    }
}

</script>

<template>

    <BooleanObject :context="context" :selection="props.context.selection" @changeBool="changeBoolgroup"
        @flatten-shape="flattenShape" :disabled="!isBoolGroup"></BooleanObject>

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