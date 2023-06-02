<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-08 09:42:33
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 16:13:35
-->
<script setup lang="ts">
import { defineProps, ref } from "vue";
import { Context } from "@/context";
import Design from "@/components/Document/Attribute/Design.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps<{
    context: Context
}>();

// type Tab = "Design" | "Prototype" | "Inspect";
type Tab = "Design" | "Inspect";


const currentTab = ref<Tab>("Design");
const tabs: { title: string, id: Tab }[] = [
    {
        title: t('attr.design'),
        id: 'Design'
    },
    // {
    //     title: t('attr.prototype'),
    //     id: 'Prototype'
    // },
    {
        title: t('attr.inspect'),
        id: 'Inspect'
    }
]

function toggle(id: Tab) {
    if (id === 'Design') {
        if (props.context.selection.selectedShapes.length === 1) {
            props.context.selection.selectShape(props.context.selection.selectedShapes[0]);
        }

    }
    currentTab.value = id;
}

</script>

<template>
    <div class="tab-container">
        <div class="controller">
            <div :class="{ tab: true, active: currentTab === i.id }" v-for="(i, index) in tabs" :key="index"
                @click="toggle(i.id)">{{ i.title }}</div>
        </div>
        <div class="body">
            <Design :context="props.context" v-if="currentTab === 'Design'"></Design>
            <!-- <CompsTab :context="props.context" v-if="currentTab === 'Prototype'"></CompsTab> -->
            <ResourceTab :context="props.context" v-if="currentTab === 'Inspect'"></ResourceTab>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    box-shadow: -4px 0px 4px rgba($color: #000000, $alpha: 0.05);

    .controller {
        height: 32px;
        width: 100%;
        flex: 0 0 auto;
        display: flex;
        flex-direction: row;
        margin-left: 13px;

        >.tab {
            font-weight: var(--font-default-bold);
            font-size: 10px;
            min-width: 36px;
            margin-right: 4px;
            margin-top: 4px;
            text-align: left;
            line-height: 24px;
            color: var(--grey-dark);
        }

        >.tab:hover {
            color: var(--theme-color);
        }

        >.active {
            border-radius: 4px 4px 0 0;
            color: var(--theme-color);
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