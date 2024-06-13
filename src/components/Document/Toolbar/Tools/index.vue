<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from "vue";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import Cursor from "../Buttons/Cursor.vue";
import Frame from "../Buttons/Frame.vue";
import GroupUngroup from "../Buttons/GroupUngroup.vue";
import CreateText from "../Buttons/CreateText.vue";
import CreateImage from "../Buttons/CreateImage.vue";
import Table from "../Buttons/Table/index.vue"
import Contact from "../Buttons/CreateContact.vue";
import Cutout from "../Buttons/Cutout.vue";
import { WorkSpace, Perm } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import PathEditTool from "@/components/Document/Toolbar/PathEditTool.vue";
import PathShape from "@/components/Document/Toolbar/Buttons/PathShape.vue";
import Export from "../Buttons/Export.vue";
import VertLine from "./VertLine.vue"
import CompsVue from "./Comps.vue"

const { t } = useI18n();

interface Props {
    context: Context
    selection: Selection
}

const props = defineProps<Props>();
const isread = ref(false)
const canComment = ref(false)
const isEdit = ref(false)
const selected = ref<Action>(Action.AutoV);
const is_path_edit = ref<boolean>(false);

function select(action: Action) {
    props.context.tool.setAction(action);
    // if (action === Action.AddComment) {
    //     nextTick(() => {
    //         props.context.comment.commentInput(false);
    //     })
    // }
}

function selectComps() {
    props.context.tool.notify(Tool.COMPONENT);
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

const postDocumentAuthority = async (data: { doc_id: any, perm_type: number, applicant_notes: any }) => {
    // try {
    //     const { code, message } = await share_api.postDocumentAuthorityAPI(data)
    //     if (code === 400 && message === '申请次数已达上限') {
    //         ElMessage.success({
    //             message: message,
    //             center: true,
    //             duration: 3000
    //         })
    //     } else {
    //         ElMessage.success({
    //             message: '权限申请已发送',
    //             center: true,
    //             duration: 3000
    //         })
    //     }
    // } catch (error) {
    //     ElMessage.success({
    //         message: '未知异常',
    //         center: true,
    //         duration: 3000
    //     })
    // }
}

function applyForEdit() {
    // const documentID = props.context.comment.isDocumentInfo?.document.id
    // postDocumentAuthority({ doc_id: documentID, perm_type: 3, applicant_notes: '' })
}


const cursorParams = {
    get d() {
        return selected.value
    },
    select,
    get is_lable() {
        return isLable.value
    },
    get edit() {
        return isEdit.value;
    },
    get active() {
        return selected.value === Action.AutoV || selected.value === Action.AutoK
    }
}

const comps: { component: any, params?: any }[] = []
comps.push(
    {
        component: Cursor,
        params: cursorParams
    },
    { component: VertLine },
    {
        component: Frame,
        params: {
            get active() {
                return selected.value === Action.AddFrame
            }
        }
    },
    { component: PathShape },
    {
        component: CreateText,
        params: {
            get active() {
                return selected.value === Action.AddText
            }
        }
    },
    {
        component: CreateImage,
        params: {
            get active() {
                return selected.value === Action.AddImage
            }
        }
    },
    {
        component: Table,
        params: {
            get active() {
                return selected.value === Action.AddTable
            }
        }
    },
    {
        component: Contact, params: {
            get active() {
                return selected.value === Action.AddContact
            }
        }
    },
    {
        component: Cutout, params: {
            get active() {
                return selected.value === Action.AddCutout
            }
        }
    },
    { component: VertLine })

const efficientPlugins = props.context.pluginsMgr.search2('toolbar.tools.efficient');
comps.push(...efficientPlugins.begin)
comps.push({ component: CompsVue })
comps.push(...efficientPlugins.end)

comps.push({ component: VertLine })

comps.push({ component: GroupUngroup })

</script>

<template>
    <div v-if="isEdit && !isLable && !is_path_edit" class="editor-tools" @dblclick.stop>
        <!-- <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
            :is_lable="isLable" :edit="isEdit"></Cursor>
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line" />
        </div>
        <Frame :context="props.context" :active="selected === Action.AddFrame" @select="select"></Frame>
        <PathShape :context="context"></PathShape>
        <CreateText @select="select" :active="selected === Action.AddText"></CreateText>
        <CreateImage :active="selected === Action.AddImage" :context="props.context"></CreateImage>
        <Table @select="select" :active="selected === Action.AddTable" :context="props.context"></Table>
        <Contact @select="select" :active="selected === Action.AddContact" :context="props.context"></Contact>
        <Cutout @select="select" :active="selected === Action.AddCutout"></Cutout>
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line" />
        </div>

        <el-tooltip class="box-item" effect="dark" :content="string_by_sys(`${t('navi.comps')} &nbsp;&nbsp; Shift I`)"
            placement="bottom" :show-after="500" :offset="10" :hide-after="0">
            <ToolButton style="width: 32px">
                <div class="temp" @click="selectComps">
                    <svg-icon icon-class="resource"></svg-icon>
                </div>
            </ToolButton>
        </el-tooltip>
        <div style="width: 16px;height: 52px;display: flex;align-items: center;justify-content: center;">
            <div class="vertical-line" />
        </div>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup> -->
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />

    </div>
    <div v-if="isread || canComment || isLable" class="editor-tools" @dblclick.stop>
        <span style="color: #ffffff;" v-if="!isLable">{{ isread ? t('apply.read_only') : t('share.reviewable') }}</span>
        <div class="button" v-if="!isLable">
            <button class="el" style="background-color: #1878F5;margin-right: 4px" @click.stop="applyForEdit">
                {{ t('apply.apply_for_edit') }}
            </button>
        </div>
        <Cursor :params="cursorParams" :context="context"></Cursor>
        <!-- <Comment v-if="!isread" @select="select" :active="selected === Action.AddComment" :context="props.context">
        </Comment> -->
        <Export :context="context" @select="select" :active="selected === Action.Export"></Export>
    </div>
    <PathEditTool v-if="isEdit && is_path_edit" class="editor-tools" :context="props.context" @select="select"
        :selected="selected"></PathEditTool>
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

    :deep(.tool-button) {
        width: 56px;
        height: 32px;
    }

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
            height: 32px;
            border-radius: 5px;
            color: #ffffff;
            background-color: #865DFF;
            border: none;
        }
    }



}
</style>