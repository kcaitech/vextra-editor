<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import ShapeTab from "@/components/Document/Navigation/ShapeTab.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import CommentTab from "./Comment/CommentTab.vue";
// import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import { useI18n } from 'vue-i18n';
import { Page } from "@kcdesign/data";
import { Action, WorkSpace } from '@/context/workspace';
import { Comment } from "@/context/comment";
const { t } = useI18n();

const props = defineProps<{ context: Context, page: Page, leftTriggleVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
type Tab = "Shape" | "Comps" | "Resource" | "Comment"

const currentTab = ref<Tab>("Shape");
const selected = ref<Action>(Action.AutoV);
const workspace = computed<WorkSpace>(() => props.context.workspace)

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
    ,
    // {
    //     title: t('navi.resource'),
    //     id: 'Resource'
    // }
]

function update(t: number) {
    if(t === Comment.SELECT_LIST_TAB) {
        selected.value = workspace.value.action;
        selectComment()
    }
}

const selectComment = () => {
    if (selected.value === Action.AddComment) {
        currentTab.value = 'Comment'
    }
}

function toggle(id: Tab) {
    currentTab.value = id
}
const showHiddenLeft = () => {
    emit('showNavigation')
}
onMounted(() => {
    props.context.comment.watch(update);
});
onUnmounted(() => {
    props.context.comment.unwatch(update);
})
</script>

<template>
    <div class="tab-container">
        <div class="tab-controller">
            <div :class="{ tab: true, active: currentTab === i.id }" v-for="(i, index) in tabs" :key="index"
                @click="toggle(i.id)">{{ i.title }}</div>
        </div>
        <div class="body">
            <ShapeTab :context="props.context" v-if="currentTab === 'Shape'" v-bind="$attrs" :page="page"
                :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></ShapeTab>
            <CompsTab :context="props.context" v-if="currentTab === 'Comps'" :showLeft="showLeft"
                :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></CompsTab>
            <!-- <ResourceTab :context="props.context" v-if="currentTab === 'Resource'"></ResourceTab> -->
            <CommentTab :context="props.context" v-if="currentTab === 'Comment'" :showLeft="showLeft"
                :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft"></CommentTab>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    box-shadow: 4px 0px 4px rgba($color: #000000, $alpha: 0.05);

    .tab-controller {
        height: 32px;
        display: flex;
        flex-direction: row;
        overflow: hidden;

        >.tab {
            min-width: 24px;
            font-weight: var(--font-default-bold);
            font-size: 10px;
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
        border-top: 1px solid var(--theme-color);
        width: 100%;
        height: calc(100% - 32px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
    }

}
</style>