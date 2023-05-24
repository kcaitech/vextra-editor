<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-08 09:42:33
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 16:13:35
-->
<script setup lang="ts">
import { defineProps, ref,computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import ShapeTab from "@/components/Document/Navigation/ShapeTab.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import CommentTab from "./CommentTab.vue";
import { useI18n } from 'vue-i18n';
import { Page } from "@kcdesign/data";
import { Action, WorkSpace } from '@/context/workspace';
const { t } = useI18n();

const props = defineProps<{ context: Context, page: Page }>();

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
        title: t('navi.resource'),
        id: 'Resource'
    }, {
        title: t('home.comment'),
        id: 'Comment'
    }
]

function update() {
    selected.value = workspace.value.action;
    selectComment()
}

const selectComment = () => {
    if(selected.value === Action.AddComment) {
        currentTab.value = 'Comment'
    }
}

function toggle(id: Tab) {
    currentTab.value = id
}
onMounted(() => {
    props.context.workspace.watch(update);
});
onUnmounted(() => {
    props.context.workspace.unwatch(update);
})
</script>

<template>
    <div class="tab-container">
        <div class="tab-controller">
            <div :class="{ tab: true, active: currentTab === i.id }" v-for="(i, index) in tabs" :key="index"
                @click="toggle(i.id)">{{ i.title }}</div>
        </div>
        <div class="body">
            <ShapeTab :context="props.context" v-if="currentTab === 'Shape'" v-bind="$attrs" :page="page"></ShapeTab>
            <CompsTab :context="props.context" v-if="currentTab === 'Comps'"></CompsTab>
            <ResourceTab :context="props.context" v-if="currentTab === 'Resource'"></ResourceTab>
            <CommentTab :context="props.context" v-if="currentTab === 'Comment'"></CommentTab>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    box-shadow: 4px 0px 4px rgba($color: #000000, $alpha: 0.05);

    .tab-controller {
        height: 36px;
        width: 100%;
        display: flex;
        flex-direction: row;
        margin-left: 13px;
        overflow: hidden;

        >.tab {
            font-weight: var(--font-default-bold);
            font-size: 10px;
            min-width: 42px;
            margin-right: 4px;
            margin-top: 4px;
            padding: 4px;
            text-align: center;
            line-height: 24px;
        }

        >.active {
            border-radius: 4px 4px 0 0;
            background-color: var(--grey-dark);
        }

    }

    .body {
        border-top: 1px solid var(--theme-color);
        width: 100%;
        height: calc(100% - 36px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
    }

}
</style>