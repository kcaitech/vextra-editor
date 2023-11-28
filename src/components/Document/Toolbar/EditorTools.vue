<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed, nextTick} from "vue";
import {Context} from '@/context';
import {Selection} from '@/context/selection';
import ToolButton from './ToolButton.vue';
import Cursor from "./Buttons/Cursor.vue";
import Frame from "./Buttons/Frame.vue";
import GroupUngroup from "./GroupUngroup.vue";
import CreateText from "./Buttons/CreateText.vue";
import CreateImage from "./Buttons/CreateImage.vue";
import Table from "./Buttons/Table/index.vue"
import Comment from "./Buttons/Comment.vue"
import Contact from "./Buttons/CreateContact.vue";
import Shape from "./Buttons/Shape.vue";
import {WorkSpace, Perm} from "@/context/workspace";
import {Action, Tool} from "@/context/tool";
import {useI18n} from 'vue-i18n'
import {message} from "@/utils/message";
import {string_by_sys} from "@/utils/common";
import {ElMessage} from "element-plus";

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
// hooks
onMounted(() => {
    hangdlePerm()
    props.context.tool.watch(tool_watcher);
});
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
})

function applyForEdit() {
    ElMessage.success({
        message: '已发送权限申请',
        center: true,
        duration: 3000
    })
}
</script>

<template>
    <div class="editor-tools" @dblclick.stop v-if="isEdit && !isLable">
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
                :is_lable="isLable" :edit="isEdit"></Cursor>
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line"/>
        </div>
        <Frame :context="props.context" :active="selected === Action.AddFrame" @select="select"></Frame>
        <Shape :context="context"></Shape>
        <CreateText @select="select" :active="selected === Action.AddText"></CreateText>
        <CreateImage :active="selected === Action.AddImage" :context="props.context"></CreateImage>
        <Table @select="select" :active="selected === Action.AddTable" :context="props.context"></Table>
        <Contact @select="select" :active="selected === Action.AddContact" :context="props.context"></Contact>
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line"/>
        </div>
        <el-tooltip class="box-item" effect="dark" :content="string_by_sys(`${t('navi.comps')} &nbsp;&nbsp; Shift I`)"
                    placement="bottom" :show-after="500" :offset="10" :hide-after="0">
            <ToolButton style="width: 32px">
                <div class="temp" @click="selectComps">
                    <svg-icon icon-class="resource"></svg-icon>
                </div>
            </ToolButton>
        </el-tooltip>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"></Comment>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup>
    </div>
    <div class="editor-tools" @dblclick.stop v-if="isread || canComment || isLable">
        <span style="color: #ffffff;">{{ t('apply.read_only') }}</span>
        <div class="button">
            <button class="el" style="background-color: #865DFF;" @click="applyForEdit">{{
                    t('apply.apply_for_edit')
                }}
            </button>
        </div>
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
                :is_lable="isLable" :edit="isEdit"></Cursor>
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line"/>
        </div>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"
                 v-if="!isread"></Comment>
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

    .button {
        margin-left: 15px;

        .el {
            height: 33px;
            border-radius: 5px;
            color: #ffffff;
            background-color: #865DFF;
        }
    }

    .temp {
        width: 32px;
        height: 32px;
        font-size: 12px;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 6px 6px 6px;
        box-sizing: border-box;

        > svg {
            width: 20px;
            height: 20px;
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