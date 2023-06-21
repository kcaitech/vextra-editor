<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from "vue";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import ToolButton from './ToolButton.vue';
import Cursor from "./Buttons/Cursor.vue";
import Frame from "./Buttons/Frame.vue";
import GroupUngroup from "./GroupUngroup.vue";
import Rect from "./Buttons/Rect.vue";
import Ellipse from "./Buttons/Ellipse.vue";
import Line from "./Buttons/Path.vue";
import Arrow from "./Buttons/Arrow.vue";
import CreateText from "./Buttons/CreateText.vue";
import CreateImage from "./Buttons/CreateImage.vue";
import Comment from "./Buttons/Comment.vue"
import { Action, WorkSpace } from "@/context/workspace";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
    context: Context,
    selection: Selection
}>();

const workspace = computed<WorkSpace>(() => props.context.workspace)

const selected = ref<Action>(Action.AutoV);

function select(action: Action) {
    workspace.value.setAction(action);
    if(action === Action.AddComment) {
        nextTick(() => {
            props.context.workspace.commentInput(false);
        })
    }
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
        <Frame :workspace="workspace" :active="selected === Action.AddFrame" @select="select"></Frame>
        <Rect @select="select" :active="selected === Action.AddRect"></Rect>
        <Ellipse @select="select" :active="selected === Action.AddEllipse"></Ellipse>
        <Line @select="select" :active="selected === Action.AddLine"></Line>
        <Arrow @select="select" :active="selected === Action.AddArrow"></Arrow>
        <CreateText @select="select" :active="selected === Action.AddText"></CreateText>
        <CreateImage :active="selected === Action.AddImage" :context="props.context"></CreateImage>
        <div class="vertical-line" />
        <el-tooltip class="box-item" effect="dark" :content="`${t('navi.comps')} &nbsp;&nbsp; Shift+I`" placement="bottom"
            :show-after="500" :offset="10" :hide-after="0">
            <ToolButton>
                <div class="temp">
                    <svg-icon icon-class="resource"></svg-icon>
                </div>
            </ToolButton>
        </el-tooltip>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"></Comment>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup>
    </div>
</template>

<style scoped lang="scss">
.editor-tools {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    .temp {
        width: 28px;
        height: 28px;
        font-size: 12px;
        color: #ffffff;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;

        >svg {
            width: 14px;
            height: 14px;
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