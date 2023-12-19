<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import ShapeTab from "@/components/Document/Navigation/ShapeTab.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import CommentTab from "./Comment/CommentTab.vue";
import { useI18n } from 'vue-i18n';
import { Page } from "@kcdesign/data";
import { Comment } from "@/context/comment";
import { Action, Tool } from "@/context/tool";

const { t } = useI18n();

interface Props {
    context: Context
    page: Page
    leftTriggleVisible: boolean
    showLeft: boolean
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
type Tab = "Shape" | "Comps" | "Resource" | "Comment"

const currentTab = ref<Tab>("Shape");
const tabs: { title: string, id: Tab }[] = [
    {
        title: t('navi.shape'),
        id: 'Shape'
    }, {
        title: t('navi.comps'),
        id: 'Comps'
    }, {
        title: t('home.comment'),
        id: 'Comment'
    }
]

function update(t: number) {
    if (t === Comment.SELECT_LIST_TAB) {
        if (!props.showLeft) showHiddenLeft();
        currentTab.value = 'Comment';
    }
}

function toggle(id: Tab) {
    currentTab.value = id;
    props.context.navi.set_current_navi_module(id);
}

const showHiddenLeft = () => {
    emit('showNavigation')
}
const tool_watch = (t: number) => {
    if (t === Tool.COMPONENT) {
        if (!props.showLeft) showHiddenLeft();
        currentTab.value = 'Comps';
        props.context.navi.set_current_navi_module(currentTab.value);
    }
}
const stopMouseDown = (e: MouseEvent) => {
    const action = props.context.tool.action;
    if (action === Action.AddComment) {
        e.stopPropagation();
    }
}
onMounted(() => {
    props.context.navi.set_current_navi_module(currentTab.value);
    props.context.comment.watch(update);
    props.context.tool.watch(tool_watch);
});
onUnmounted(() => {
    props.context.comment.unwatch(update);
    props.context.tool.watch(tool_watch);
})
</script>

<template>
    <div class="tab-container" @mouseup="stopMouseDown">
        <div class="tab-controller">
            <div :class="{ tab: true, active: currentTab === i.id }" v-for="(i, index) in tabs" :key="index"
                @click="toggle(i.id)">{{ i.title }}
            </div>
        </div>
        <div class="body">
            <ShapeTab :context="props.context" v-show="currentTab === 'Shape'" v-bind="$attrs" :page="page"
                :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></ShapeTab>
            <CompsTab :context="props.context" v-show="currentTab === 'Comps'" :showLeft="showLeft"
                :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></CompsTab>
            <CommentTab :context="props.context" v-show="currentTab === 'Comment'" :showLeft="showLeft"
                :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></CommentTab>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    border-right: 1px solid #EBEBEB;
    box-sizing: border-box;

    .tab-controller {
        height: 40px;
        display: flex;
        flex-direction: row;
        overflow: hidden;

        >.tab {
            min-width: 24px;
            font-weight: var(--font-default-bold);
            font-size: var(--font-default-fontsize);
            margin-right: 4px;
            margin-top: 4px;
            text-align: left;
            line-height: 24px;
            color: var(--grey-dark);
            margin-left: 6px;
        }

        >.tab:hover {
            color: var(--theme-color);
        }

        >.active {
            color: var(--theme-color);
        }

    }

    .body {
        border-top: 1px solid #F0F0F0;
        width: 100%;
        height: calc(100% - 32px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
        box-shadow: inset 0px -1px 0px 0px #F0F0F0;
    }

}
</style>