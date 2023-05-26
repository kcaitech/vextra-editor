<script setup lang="ts">
import { Selection } from '@/context/selection';
import { WorkSpace } from '@/context/workspace';
import { Shape, ShapeType, GroupShape } from '@kcdesign/data';
import { defineProps, computed, onMounted, onUnmounted, ref } from 'vue';
import { Context } from '@/context';
import ToolButton from "./ToolButton.vue"
import { useI18n } from 'vue-i18n';
import { getName } from '@/utils/content';
const { t } = useI18n()

const props = defineProps<{ context: Context, selection: Selection }>();
const editor = computed(() => {
    if (props.selection.selectedPage == undefined) {
        throw new Error("No Selected Page?");
    }
    return props.context.editor4Page(props.selection.selectedPage);
})

const NOGROUP = 0;
const GROUP = 1;
const UNGROUP = 2;
const state = ref(0);
// const preState = ref(0);
// function setState(s: number) {
//     if (state.value !== NOGROUP) preState.value = state.value;
//     state.value = s;
// }
const updater = (t?: number) => {
    if (t === Selection.CHANGE_SHAPE) {
        state.value = 0;
        const selection = props.selection;
        const shapes = selection.selectedShapes;
        if (shapes.length === 0) {
            state.value = state.value ^ NOGROUP;
        } else if (shapes.length === 1) {
            const type = shapes[0].type;
            if (type === ShapeType.Group || type === ShapeType.Artboard) {
                state.value = state.value ^ UNGROUP;
                state.value = state.value ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        } else {
            const groups = shapes.filter(s => s.type === ShapeType.Group || s.type === ShapeType.Artboard);
            if (groups.length) {
                state.value = state.value ^ UNGROUP;
                state.value = state.value ^ GROUP;
            } else {
                state.value = state.value ^ GROUP;
            }
        }
    }
    // const len = props.selection.selectedShapes.length;
    // if (len === 0) {
    //     setState(NOGROUP);
    // } else if (len === 1) {
    //     const shape = props.selection.selectedShapes[0];
    //     if (shape instanceof GroupShape && !(shape instanceof Artboard || shape instanceof Page)) {
    //         setState(UNGROUP);
    //     } else {
    //         setState(NOGROUP);
    //     }
    // } else {
    //     let val = GROUP;
    //     for (let i = 0; i < len; i++) {
    //         const shape = props.selection.selectedShapes[i];
    //         if (shape instanceof Artboard || shape instanceof Page) {
    //             val = UNGROUP;
    //             break;
    //         }
    //     }
    //     setState(val);
    // }
}
function workspaceUpdate(t?: number) {
    if (t === WorkSpace.GROUP) {
        groupClick();
    } else if (t === WorkSpace.UNGROUP) {
        ungroupClick();
    }
}
onMounted(() => {
    props.context.workspace.watch(workspaceUpdate)
    props.selection.watch(updater);
    updater();
})
onUnmounted(() => {
    props.selection.unwatch(updater);
    props.context.workspace.unwatch(workspaceUpdate)
})

const groupClick = () => {
    const selection = props.selection;
    const shapes = selection.selectedShapes;
    const page = selection.selectedPage;
    if (shapes.length) {
        const name = getName(ShapeType.Group, page?.flatShapes || [], t);
        const group = editor.value.group(props.selection.selectedShapes, name);
        if (group) {
            props.selection.selectShape(group);
        }
    }
}
const ungroupClick = () => {
    const selection = props.selection;
    const shapes = selection.selectedShapes;
    if (shapes.length) {
        const groups = shapes.filter(i => i.type === ShapeType.Group);
        const others: Shape[] = shapes.filter(i => i.type !== ShapeType.Group);
        if (groups.length) {
            for (let i = 0, len = groups.length; i < len; i++) {
                const g = groups[i];
                const c = editor.value.ungroup(g as GroupShape);
                if (c) {
                    others.push(...c);
                }
            }
            selection.rangeSelectShape(others);
        }
    }
}
</script>

<template>
    <el-tooltip v-if="state" class="box-item" effect="dark"
        :content="state & GROUP ? `${t('home.groups')} &nbsp;&nbsp; Ctrl+G` : `${t('home.ungroup')} &nbsp;&nbsp; Ctrl+Shift+G`"
        placement="bottom" :show-after="500" :offset="5" :hide-after="0">
        <div class="group">
            <ToolButton :onclick="groupClick" :valid="true" :selected="false" v-if="state & GROUP">
                <svg-icon icon-class="group"></svg-icon>
            </ToolButton>
            <ToolButton :onclick="ungroupClick" :valid="true" :selected="false" v-if="state & UNGROUP">
                <svg-icon icon-class="ungroup"></svg-icon>
            </ToolButton>
        </div>
    </el-tooltip>
</template>

<style scoped lang="scss">
div.group {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    width: 40px;

    >div {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ffffff;

        >svg {
            height: 55%;
            width: 55%;
        }
    }

}
</style>