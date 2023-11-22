<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed, nextTick} from "vue";
import {Context} from '@/context';
import {Selection} from '@/context/selection';
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
import {WorkSpace, Perm} from "@/context/workspace";
import {Action, Tool} from "@/context/tool";
import {useI18n} from 'vue-i18n'
import {message} from "@/utils/message";
import PathEditTool from "@/components/Document/Toolbar/PathEditTool.vue";

const {t} = useI18n();

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
const is_path_edit = ref<boolean>(false);

function select(action: Action) {
    props.context.tool.setAction(action);
    if (action === Action.AddComment) {
        nextTick(() => {
            props.context.comment.commentInput(false);
        })
    }
}

function selectComps() {
    message('feature', t('navi.development'));
}

const isLable = ref(props.context.tool.isLable);

function tool_watcher(t?: number) {
    if (t === Tool.CHANGE_ACTION) {
        selected.value = props.context.tool.action;
        console.log('selected.value changed', selected.value);
    } else if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}

//获取文档权限
const hangdlePerm = () => {
    const perm = props.context.workspace.documentPerm;
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

function workspace_watcher(t: number) {
    if (t === WorkSpace.PATH_EDIT_MODE) {
        is_path_edit.value = props.context.workspace.is_path_edit_mode
    }
}

// hooks
onMounted(() => {
    hangdlePerm()
    props.context.tool.watch(tool_watcher);
    props.context.workspace.watch(workspace_watcher);
});
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
    props.context.tool.unwatch(workspace_watcher);
})
</script>

<template>
    <div v-if="isEdit && !isLable && !is_path_edit" class="editor-tools" @dblclick.stop>
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
                :is_lable="isLable" :edit="isEdit"></Cursor>
        <div class="vertical-line"/>
        <Frame :context="props.context" :active="selected === Action.AddFrame" @select="select"></Frame>
        <Rect @select="select" :active="selected === Action.AddRect"></Rect>
        <Ellipse @select="select" :active="selected === Action.AddEllipse"></Ellipse>
        <Line @select="select" :active="selected === Action.AddLine"></Line>
        <Arrow @select="select" :active="selected === Action.AddArrow"></Arrow>
        <CreateText @select="select" :active="selected === Action.AddText"></CreateText>
        <CreateImage :active="selected === Action.AddImage" :context="props.context"></CreateImage>
        <Table @select="select" :active="selected === Action.AddTable" :context="props.context"></Table>
        <Contact @select="select" :active="selected === Action.AddContact" :context="props.context"></Contact>
        <div class="vertical-line"/>
        <CreateComps @select="select" :context="props.context"></CreateComps>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"></Comment>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup>
    </div>
    <div v-if="isread || canComment || isLable" class="editor-tools" @dblclick.stop>
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
                :is_lable="isLable" :edit="isEdit"></Cursor>
        <div class="vertical-line"/>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"
                 v-if="!isread"></Comment>
    </div>
    <PathEditTool v-if="isEdit && is_path_edit" class="editor-tools" :context="props.context" @select="select"
                  :selected="selected"
    ></PathEditTool>
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
    overflow: hidden;

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