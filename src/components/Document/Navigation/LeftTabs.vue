<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-08 09:42:33
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 16:13:35
-->
<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Context } from "@/context";
import ShapeTab from "@/components/Document/Navigation/ShapeTab.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import { useI18n } from 'vue-i18n';
import { Page } from "@kcdesign/data/data/page";
const { t } = useI18n();

const props = defineProps<{ context: Context, page: Page }>();

type Tab = "Shape" | "Comps" | "Resource"

const currentTab = ref<Tab>("Shape");

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
    }
]

function toggle(id: Tab) {
    currentTab.value = id
}

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
            </div>
        </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;

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