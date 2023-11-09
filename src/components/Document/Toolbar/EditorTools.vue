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
import { WorkSpace, Perm } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import { message } from "@/utils/message";
import { string_by_sys } from "@/utils/common";
import ShapeMenu from "./ShapeMenu.vue";

const { t } = useI18n();
interface Props {
    context: Context
    selection: Selection
    select?: any
    d: Action
    active: boolean
    is_lable: boolean
    edit: boolean
}
const props = defineProps<Props>();
const workspace = computed<WorkSpace>(() => props.context.workspace)
const isread = ref(false)
const canComment = ref(false)
const isEdit = ref(false)
const selected = ref<Action>(Action.AutoV);
const popoverVisible = ref(false);
const popover = ref<HTMLDivElement>()
const trigger = ref<HTMLDivElement>()
const selects = ref<Action>(Action.AddRect);
const visible = ref(false)
type Button = InstanceType<typeof ToolButton>
const button = ref<Button>();
const patterns = ((items: [string, Action, string][]) => (items.map(item => ({ value: item[0], content: item[1], key: item[2] }))))([
    ['rect', Action.AddRect, 'R'],
    ['oval', Action.AddEllipse, 'O'],
    ['line', Action.AddLine, 'L'],
    ['arrow', Action.AddEllipse, 'Shift L']
]);
const emit = defineEmits<{
    (e: "select", action: Action): void;
}>();
function select_shape(action: Action) {
    emit('select', action);
}

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
    if (t === Tool.CHANGE_ACTION) selected.value = props.context.tool.action;
    if (t === Tool.LABLE_CHANGE) {
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
function showMenu(e: MouseEvent) {
    if (popoverVisible.value) return popoverVisible.value = false;
    if (button.value?.toolButtonEl) {
        const el = button.value?.toolButtonEl
        visible.value = false
        popoverVisible.value = true
        nextTick(() => {
            if (popover.value) {
                popover.value.style.left = el.offsetLeft + -5 + 'px';
                popover.value.style.top = el.offsetHeight + 13 + 'px';
            }
        })
        document.addEventListener('click', onMenuBlur)
    }
}
function onMenuBlur(e: MouseEvent) {
    if (e.target instanceof Element && !e.target.closest('.popover-f') && !e.target.closest('.button-right')) {
        let timer = setTimeout(() => {
            popoverVisible.value = false;
            clearTimeout(timer)
            document.removeEventListener('click', onMenuBlur);
        }, 10)
    }
}
function close() {
    popoverVisible.value = false;
}
const selector = (active: Action) => {
    selected.value = active
    emit('select', active)
    popoverVisible.value = false
}
var timer: any = null
const onMouseenter = () => {
    timer = setTimeout(() => {
        visible.value = true
        clearTimeout(timer)
    }, 600)
}
const onMouseleave = () => {
    clearTimeout(timer)
    visible.value = false
}
function get_current_icon_class() {
    if (props.d === Action.AddRect) {

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
    <div class="editor-tools" @dblclick.stop v-if="isEdit && !isLable">
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
            :is_lable="isLable" :edit="isEdit"></Cursor>
        <div class="vertical-line" />
        <Frame :context="props.context" :active="selected === Action.AddFrame" @select="select"></Frame>

        <!-- <Rect @select="select" :active="selected === Action.AddRect"></Rect>
        <Ellipse @select="select" :active="selected === Action.AddEllipse"></Ellipse>
        <Line @select="select" :active="selected === Action.AddLine"></Line>
        <Arrow @select="select" :active="selected === Action.AddArrow"></Arrow> -->

        <!-- <div class="menu">
            <div ref="popover" class="popover-f" tabindex="-1" v-if="popoverVisible">
                <Rect @select="select" :active="selected === Action.AddRect" @close="close"></Rect>
                <Ellipse @select="select" :active="selected === Action.AddEllipse" @close="close"></Ellipse>
                <Line @select="select" :active="selected === Action.AddLine" @close="close"></Line>
                <Arrow @select="select" :active="selected === Action.AddArrow" @close="close"></Arrow>
            </div>
            <el-tooltip class="box-item" effect="dark" :content="`${t('shape.shape_tool')}`" placement="bottom"
                :show-after="600" :offset="10" :hide-after="0">
                <ToolButton> -->
        <!-- <div class="button-left" @click="showMenu" ref="trigger">
                    <svg-icon :icon-class="select"></svg-icon>
                </div> -->
        <!-- <div class="button-right" @click="showMenu" ref="trigger">
                    <svg-icon icon-class="down"></svg-icon>
                </div>
            </ToolButton>
            </el-tooltip>
        </div> -->

        <div ref="popover" class="popover-f" tabindex="-1" v-if="popoverVisible">
            <template v-for="item in patterns" :key="item.value">
                <ShapeMenu @select-rect="selector" :lg="item.value" :quick="item.key" :d="d" :select="item.content"
                    type="rect"></ShapeMenu>
            </template>
        </div>
        <!-- <el-tooltip class="box-item" effect="dark" :content=""></el-tooltip> -->
        <ToolButton ref="button" @click="() => { select(selects) }" :selected="props.active" @mouseenter.stop="onMouseenter"
            @mouseleave.stop="onMouseleave">
            <div class="svg-container">
                <svg-icon :icon-class="get_current_icon_class()"></svg-icon>
            </div>
            <div class="menu" @click="showMenu" v-if="edit && !is_lable">
                <svg-icon icon-class="down"></svg-icon>
            </div>
        </ToolButton>

        <CreateText @select="select" :active="selected === Action.AddText"></CreateText>
        <CreateImage :active="selected === Action.AddImage" :context="props.context"></CreateImage>
        <Table @select="select" :active="selected === Action.AddTable" :context="props.context"></Table>
        <Contact @select="select" :active="selected === Action.AddContact" :context="props.context"></Contact>
        <div class="vertical-line" />
        <el-tooltip class="box-item" effect="dark" :content="string_by_sys(`${t('navi.comps')} &nbsp;&nbsp; Shift I`)"
            placement="bottom" :show-after="500" :offset="10" :hide-after="0">
            <ToolButton>
                <div class="temp" @click="selectComps">
                    <svg-icon icon-class="resource"></svg-icon>
                </div>
            </ToolButton>
        </el-tooltip>
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace"></Comment>
        <GroupUngroup :context="props.context" :selection="props.selection"></GroupUngroup>
    </div>
    <div class="editor-tools" @dblclick.stop v-if="isread || canComment || isLable">
        <Cursor @select="select" :d="selected" :active="selected === Action.AutoV || selected === Action.AutoK"
            :is_lable="isLable" :edit="isEdit"></Cursor>
        <div class="vertical-line" />
        <Comment @select="select" :active="selected === Action.AddComment" :workspace="workspace" v-if="!isread"></Comment>
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

    .menu {

        .button-left {
            width: 28px;
            height: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 3px;
            color: #ffffff;

            >svg {
                width: 13px;
                height: 13px;
            }
        }

        .button-right {
            width: 10px;
            height: 28px;
            display: flex;
            padding-right: 4px;
            margin-right: 2px;
            justify-content: center;
            align-items: center;
            color: #ffffff;
            transition: 0.3s;

            >svg {
                width: 80%;
                height: 60%;
            }
        }

        .button-right:hover {
            transform: translateY(4px);
        }

        .popover-f {
            position: absolute;
            color: #ffffff;
            z-index: 999;
            width: 150px;
            height: auto;
            font-size: var(--font-default-fontsize);
            background-color: var(--theme-color);
            border-radius: 4px;
            outline: none;
            padding: var(--default-padding-half) 0;

            >div {
                position: relative;
                width: 100%;
                height: 28px;
                left: -2px;
                padding: 0 var(--default-padding);
                display: flex;
                flex-direction: row;
                align-items: center;
                box-sizing: border-box;

                &:hover {
                    background-color: var(--active-color);
                }
            }
        }
    }
}
</style>