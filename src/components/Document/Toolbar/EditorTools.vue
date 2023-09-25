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
import Table from "./Buttons/Table/index.vue"
import Comment from "./Buttons/Comment.vue"
import Contact from "./Buttons/CreateContact.vue";
import CreateComps from "./Buttons/CreateComps.vue";
import { WorkSpace, Perm } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import { message } from "@/utils/message";
import { string_by_sys } from "@/utils/common";
const { t } = useI18n();
interface Props {
    context: Context
    selection: Selection
}
const props = defineProps<Props>();
const workspace = computed<WorkSpace>(() => props.context.workspace)
const isread = ref(false)
const canComment = ref(false)
const isEdit = ref(false)
const selected = ref<Action>(Action.AutoV);
function select(action: Action) {
    props.context.tool.setAction(action);
    if (action === Action.AddComment) {
        nextTick(() => {
            props.context.comment.commentInput(false);
        })
    }
}

function tool_watcher(t?: number) {
    if (t === Tool.CHANGE_ACTION) selected.value = props.context.tool.action;
}
//获取文档权限
const hangdlePerm = () => {
    const perm = props.context.workspace.documentPerm
    console.log(perm,'perm');
    
    if (perm === Perm.isRead) {
        isread.value = true
    } else if (perm === Perm.isComment) {
        isread.value = false
        canComment.value = true
    } else {
        isread.value = false
        canComment.value = false
        isEdit.value = true
    }
}

// hooks
onMounted(() => {
    hangdlePerm()
    props.context.tool.watch(tool_watcher);
});
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})
</script>

<template>
    <div class="editor-tools" @dblclick.stop v-if="isEdit">
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"></Cursor>
        <div class="vertical-line" />
        <Frame :context="props.context" :active="selected === Action.AddFrame" @select="select"></Frame>
        <Rect @select="select" :active="selected === Action.AddRect"></Rect>
        <Ellipse @select="select" :active="selected === Action.AddEllipse"></Ellipse>
        <Line @select="select" :active="selected === Action.AddLine"></Line>
        <Arrow @select="select" :active="selected === Action.AddArrow"></Arrow>
        <CreateText @select="select" :active="selected === Action.AddText"></CreateText>
        <CreateImage :active="selected === Action.AddImage" :context="props.context"></CreateImage>
        <Table @select="select" :active="selected === Action.AddTable" :context="props.context"></Table>
        <Contact @select="select" :active="selected === Action.AddContact" :context="props.context"></Contact>
        <div class="vertical-line" />
        <CreateComps @select="select" :active="selected === Action.AddComponent" :context="props.context"></CreateComps>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"></Comment>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup>
    </div>
    <div class="editor-tools" @dblclick.stop v-if="isread || canComment">
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"></Cursor>
        <div class="vertical-line" />
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"></Comment>
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

    &::-webkit-scrollbar {
        width: 0px;
        height: 0px;
    }

    &::-webkit-scrollbar-track {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: none;
    }

    &::-webkit-scrollbar-thumb:active {
        background-color: none;
    }

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