<script setup lang="ts">
import { Selection } from '@/context/selection';
import { Tool } from "@/context/tool"
import { Shape, ShapeType, GroupShape, Artboard, BoolOp } from '@kcdesign/data';
import { onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
import ToolButton from "./ToolButton.vue"
import { useI18n } from 'vue-i18n';
import { getName } from '@/utils/content';
import { debounce } from 'lodash';
import { sort_by_layer } from '@/utils/group_ungroup';
import { string_by_sys } from '@/utils/common';
import Tooltip from '@/components/common/Tooltip.vue';
import BooleanObject from "./Buttons/BooleanObject.vue"
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
            if (type === ShapeType.FlattenShape || type === ShapeType.Group) {
                isBoolGroup.value = true
            } else {
                isBoolGroup.value = false
            }
            if (type === ShapeType.Group || type === ShapeType.Artboard) {
                state.value = state.value ^ UNGROUP;
                state.value = state.value ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        } else {
            isBoolGroup.value = true
            const groups = shapes.filter(s => s.type === ShapeType.Group || s.type === ShapeType.Artboard);
            if (groups.length) {
                state.value = state.value ^ UNGROUP;
                state.value = state.value ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        }
    }
}
const updater = debounce(_updater, 50);
function toolUpdate(t?: number, alt?: boolean) {
    if (t === Tool.GROUP) {
        groupClick(alt);
    } else if (t === Tool.UNGROUP) {
        ungroupClick();
    }
}
onMounted(() => {
    props.context.tool.watch(toolUpdate)
    props.selection.watch(updater);
    updater();
})
onUnmounted(() => {
    props.selection.unwatch(updater);
    props.context.tool.unwatch(toolUpdate)
})

const groupClick = (alt?: boolean) => {
    if (state.value & GROUP) {
        props.context.workspace.setSelectionViewUpdater(false);
        const selection = props.selection;
        const shapes = selection.selectedShapes;
        const page = selection.selectedPage;
        if (page) {
            if (shapes.length) {
                const bro = Array.from(page.shapes.values());
                const editor = props.context.editor4Page(page);
                const shapes = sort_by_layer(props.context, props.context.selection.selectedShapes);
                if (alt) {
                    const name = getName(ShapeType.Artboard, bro || [], t);
                    const artboard = editor.create_artboard(shapes, name);
                    if (artboard) {
                        props.selection.selectShape(artboard);
                        props.selection.notify(Selection.EXTEND, artboard);
                        state.value = 0;
                        state.value = state.value ^ UNGROUP;
                        state.value = state.value ^ GROUP;
                    }
                } else {
                    const name = getName(ShapeType.Group, bro || [], t);
                    const group = editor.group(shapes, name);
                    if (group) {
                        props.selection.selectShape(group);
                        props.selection.notify(Selection.EXTEND, group);
                        state.value = 0;
                        state.value = state.value ^ UNGROUP;
                        state.value = state.value ^ GROUP;
                    }
                }
            }
        }
        props.context.workspace.setSelectionViewUpdater(true);
        props.context.workspace.selectionViewUpdate();
    }
}
const ungroupClick = () => {
    if (state.value & UNGROUP) {
        const selection = props.selection;
        const shapes = selection.selectedShapes;
        if (shapes.length) {
            const groups = shapes.filter(i => i.type === ShapeType.Group || i.type === ShapeType.Artboard);
            const others: Shape[] = shapes.filter(i => i.type !== ShapeType.Group);
            if (groups.length) {
                const page = selection.selectedPage;
                if (page) {
                    const editor = props.context.editor4Page(page);
                    for (let i = 0, len = groups.length; i < len; i++) {
                        const g = groups[i];
                        if (g.type === ShapeType.Group) {
                            const c = editor.ungroup(g as GroupShape);
                            if (c) {
                                others.push(...c);
                            }
                        } else if (g.type === ShapeType.Artboard) {
                            const c = editor.dissolution_artboard(g as Artboard);
                            if (c) {
                                others.push(...c);
                            }
                        }
                    }
                    if (others.length) {
                        selection.rangeSelectShape(others);
                    } else {
                        selection.resetSelectShapes();
                    }
                }
            }
        }
    }
}

const changeBoolgroup = (type: BoolOp, name: string) => {
    const selection = props.selection;
    const shapes = selection.selectedShapes;
    const page = props.context.selection.selectedPage;
    if (shapes.length && page) {
        if (shapes.length === 1 && shapes[0] instanceof GroupShape) {
            const editor = props.context.editor4Shape(shapes[0])
            editor.setBoolOp(type, name)
            props.context.selection.notify(Selection.CHANGE_SHAPE)
        } else {
            const editor = props.context.editor4Page(page)
            const g = editor.boolgroup(shapes, name, type)
            if (g) {
                props.context.selection.selectShape(g)
            }
        }
    }
}

const flattenShape = () => {
    const page = props.context.selection.selectedPage;
    const selection = props.selection;
    const shapes = selection.selectedShapes;
    if (page && shapes.length) {
        if (shapes.length === 1 && shapes[0] instanceof GroupShape) {
            const editor = props.context.editor4Page(page)
            editor.flattenBoolShape(shapes[0])
        }
    }
}

</script>

<template>
    <div class="container">
        <div class="vertical-line"></div>
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
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: gray;
            transition: 0.1s;

            >svg {
                height: 55%;
                width: 55%;
            }
        }

        >.active {
            color: #ffffff;
        }
    }

    .vertical-line {
        width: 1px;
        height: 28px;
        background-color: grey;
        flex: 0 0 auto;
        margin-left: 5px;
        margin-right: 5px;
    }
}
</style>