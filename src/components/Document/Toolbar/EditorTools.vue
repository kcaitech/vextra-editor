<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-27 14:56:57
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 09:57:17
 * @FilePath: \kcdesign\src\components\Document\Toolbar\EditorTools.vue
-->
<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref, computed } from "vue";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import ToolButton from './ToolButton.vue';
import Cursor from "./Buttons/Cursor.vue";
import Frame from "./Buttons/Frame.vue";
import GroupUngroup from "./GroupUngroup.vue";
import Rect from "./Buttons/Rect.vue";
import { Action, WorkSpace } from "@/context/workspace";

const props = defineProps<{ 
    context: Context,
    selection: Selection
}>();

const workspace = computed<WorkSpace>(() => props.context.workspace)

const selected = ref<Action>(Action.AutoV);

function select(action: Action) {
    workspace.value.setAction(action);
}

function update() {    
    selected.value = workspace.value.action;
}
// hooks
onMounted(() => {
    props.context.workspace.watch(update);
});
onUnmounted(() => {
    props.context.workspace.unwatch(update);
})
</script>

<template>
    <div class="editor-tools" @dblclick.stop>
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"></Cursor>
        <div class="vertical-line" />
        <Frame></Frame>
        <Rect @select="select" :active="selected === Action.AddRect" ></Rect>
        <ToolButton>
            <div class="temp" title="Text">
                <svg-icon icon-class="text"></svg-icon>
            </div>
        </ToolButton>
        <div class="vertical-line" />
        <ToolButton>
            <div class="temp" title="Resource">
                <svg-icon icon-class="resource"></svg-icon>
            </div>
        </ToolButton>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup>
    </div>
    
</template>

<style scoped lang="scss">
    .editor-tools {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        height: 40px;
        div {
            margin: auto 4px;
        }
        .temp {
            width: 28px;
            height: 28px;
            font-size: 12px;
            color: #ffffff;
            box-sizing: border-box;
            padding: 4px;
            > svg {
                width: 100%;
                height: 100%;
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