<script setup lang="ts">
import { Selection } from '@/context/selection';
import { Shape, ShapeType, GroupShape, Artboard, BoolOp } from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
import ToolButton from "./ToolButton.vue"
import { useI18n } from 'vue-i18n';
import { getName } from '@/utils/content';
import { debounce } from 'lodash';
import { compare_layer_3, filter_for_group1 } from '@/utils/group_ungroup';
import { string_by_sys } from '@/utils/common';
import Tooltip from '@/components/common/Tooltip.vue';
import BooleanObject from "./Buttons/BooleanObject.vue"
import { Tool } from '@/context/tool';
import { WorkSpace } from '@/context/workspace';

const { t } = useI18n();
const props = defineProps<{ context: Context, selection: Selection }>();
const NOGROUP = 0;
const GROUP = 1;
const UNGROUP = 2;
const isBoolGroup = ref(false)
const state = ref(0);

function _updater(t?: number) {
    if (t === Selection.CHANGE_SHAPE) {
        state.value = 0;
        const selection = props.selection;
        const shapes = selection.selectedShapes;
        if (shapes.length === 0) {
            state.value = state.value ^ NOGROUP;
            isBoolGroup.value = false
        } else if (shapes.length === 1) {
            const type = shapes[0].type;
            if (type === ShapeType.Group) {
                isBoolGroup.value = true
            } else {
                isBoolGroup.value = false
            }
            if (type === ShapeType.Group || type === ShapeType.Artboard) {
                state.value = state.value ^ UNGROUP ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        } else {
            isBoolGroup.value = true
            const groups = shapes.filter(s => s.type === ShapeType.Group || s.type === ShapeType.Artboard);
            if (groups.length) {
                state.value = state.value ^ UNGROUP ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        }
    }
}

const updater = debounce(_updater, 50);

function tool_watcher(t?: number, alt?: boolean) {
    if (t === Tool.GROUP) groupClick(alt);
    else if (t === Tool.UNGROUP) ungroupClick();
}

onMounted(() => {
    props.context.tool.watch(tool_watcher)
    props.selection.watch(updater);
    updater();
})
onUnmounted(() => {
    props.selection.unwatch(updater);
    props.context.tool.unwatch(tool_watcher)
})

const groupClick = (alt?: boolean) => {
    if (!(state.value & GROUP)) return;
    props.context.workspace.setSelectionViewUpdater(false);
    const selection = props.selection;
    let shapes = filter_for_group1(selection.selectedShapes);
    const page = selection.selectedPage;
    if (!page || !shapes.length) return;
    const bro = Array.from(page.shapes.values());
    const editor = props.context.editor4Page(page);
    shapes = compare_layer_3(shapes);
    if (alt) {
        const name = getName(ShapeType.Artboard, bro || [], t);
        const artboard = editor.create_artboard(shapes, name);
        if (artboard) {
            props.selection.selectShape(artboard);
            props.selection.notify(Selection.EXTEND, artboard);
            state.value = 0;
            state.value = state.value ^ UNGROUP ^ GROUP;
        }
    } else {
        const name = getName(ShapeType.Group, bro || [], t);
        const group = editor.group(shapes, name);
        if (group) {
            props.selection.selectShape(group);
            props.selection.notify(Selection.EXTEND, group);
            state.value = 0;
            state.value = state.value ^ UNGROUP ^ GROUP;
        }
    }
    props.context.workspace.setSelectionViewUpdater(true);
    props.context.workspace.notify(WorkSpace.SELECTION_VIEW_UPDATE);
}
const ungroupClick = () => {
    if (!(state.value & UNGROUP)) return;
    const selection = props.selection;
    const shapes = selection.selectedShapes;
    if (!shapes.length) return;
    const groups = shapes.filter(i => i.type === ShapeType.Group || i.type === ShapeType.Artboard);
    const others: Shape[] = shapes.filter(i => i.type !== ShapeType.Group);
    if (!groups.length) return;
    const page = selection.selectedPage;
    if (!page) return;
    const editor = props.context.editor4Page(page);
    const _groups = [];
    for (let i = 0, len = groups.length; i < len; i++) {
        const g = groups[i];
        if (g.type === ShapeType.Group) {
            _groups.push(g);
        } else if (g.type === ShapeType.Artboard) {
            const c = editor.dissolution_artboard(g as Artboard);
            if (c) {
                others.push(...c);
            }
        }
    }
    const s = editor.ungroup(_groups as GroupShape[]);
    if (s) {
        others.push(...s);
    }
    if (others.length) {
        selection.rangeSelectShape(others);
    } else {
        selection.resetSelectShapes();
    }
}
/**
 * @description 布尔操作
 */
const changeBoolgroup = (type: BoolOp, n: string) => {
    const selection = props.selection;
    const shapes = selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    const name = t(`bool.${n}`)
    if (shapes.length && page) {
        if (shapes.length === 1 && shapes[0] instanceof GroupShape) {
            const editor = props.context.editor4Shape(shapes[0])
            editor.setBoolOp(type, name)
            props.context.selection.notify(Selection.CHANGE_SHAPE)
        } else if (shapes.length > 1) {
            const shapessorted = compare_layer_3(filter_for_group1(shapes));
            const editor = props.context.editor4Page(page)
            const g = editor.boolgroup(shapessorted, name, type)
            if (g) {
                props.context.selection.selectShape(g)
            }
        }
    }
}
/**
 * @description 路径拼合
 */
const flattenShape = () => {
    const page = props.context.selection.selectedPage;
    const selection = props.selection;
    const shapes = compare_layer_3(filter_for_group1(selection.selectedShapes));
    if (page && shapes.length) {
        const editor = props.context.editor4Page(page)
        if (shapes.length === 1 && shapes[0] instanceof GroupShape) {
            const flatten = editor.flattenBoolShape(shapes[0])
            if (flatten) {
                props.context.selection.selectShape(flatten)
            }
        } else if (shapes.length > 1) {
            const shapessorted = compare_layer_3(shapes);
            const flatten = editor.flattenShapes(shapessorted)
            if (flatten) {
                props.context.selection.selectShape(flatten)
            }
        }
    }
}

</script>

<template>
    <div class="container">
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line" />
        </div>
        <Tooltip :content="string_by_sys(`${t('home.groups')} &nbsp;&nbsp; Ctrl G`)" :offset="5">
            <div class="group">
                <ToolButton :onclick="(e: MouseEvent) => groupClick(e.altKey)" :valid="true" :selected="false"
                    :class="{ active: state & GROUP }">
                    <svg-icon icon-class="group"></svg-icon>
                </ToolButton>
            </div>
        </Tooltip>

        <BooleanObject :context="context" :selection="selection" @changeBool="changeBoolgroup" v-if="isBoolGroup"
            @flatten-shape="flattenShape"></BooleanObject>

        <Tooltip :content="string_by_sys(`${t('home.ungroup')} &nbsp;&nbsp; Ctrl Shift G`)" :offset="5">
            <div class="group">
                <ToolButton :onclick="ungroupClick" :valid="true" :selected="false" :class="{ active: state & UNGROUP }">
                    <svg-icon icon-class="ungroup"></svg-icon>
                </ToolButton>
            </div>
        </Tooltip>
    </div>
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