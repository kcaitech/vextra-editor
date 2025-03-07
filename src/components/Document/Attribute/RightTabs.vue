/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { Context } from "@/context";
import Design from "@/components/Document/Attribute/Design.vue";
import Prototype from "@/components/Document/Attribute/Prototype.vue";
import ResourceTab from "@/components/Document/Navigation/ResourceTab.vue";
import { useI18n } from 'vue-i18n';
import { Tool } from "@/context/tool";
import Lable from './Lable/index.vue';
import { Menu } from "@/context/menu";
const { t } = useI18n();

interface Props {
    context: Context
}

type Tab = "Design" | "Prototype";

const props = defineProps<Props>();
const controllerRef = ref<HTMLElement>();
const underlineWidth = ref(0);
const underlinePosition = ref(0);
const currentTab = ref<Tab>("Design");
const tabs: { title: string, id: Tab }[] = [
    {
        title: t('attr.design'),
        id: 'Design'
    },
    {
        title: t('attr.prototype'),
        id: 'Prototype'
    }
];
const isLable = ref(props.context.tool.isLable);

function toggle(id: Tab) {
    currentTab.value = id;
    init();
    updateUnderlinePosition();
}
function init() {
    if (currentTab.value === 'Design') {
        const selected = [...props.context.selection.selectedShapes];
        if (selected.length) {
            props.context.selection.rangeSelectShape(selected);
        }
    }
}
function updateUnderlinePosition() {
    underlinePosition.value = 0;
    underlineWidth.value = 0;
    if (!controllerRef.value) {
        return;
    }
    const tabIndex = tabs.findIndex((tab) => tab.id === currentTab.value);
    if (tabIndex < 0) {
        return;
    }
    const key = tabs[tabIndex].id;
    const dom = controllerRef.value.querySelector(`#tabs-id-${key}`);
    if (!dom) {
        return;
    }
    const width = (dom as HTMLDivElement).offsetWidth - 20;
    const left = (dom as HTMLDivElement).offsetLeft + 10;
    underlineWidth.value = width;
    underlinePosition.value = left + width / 2;
}
const tool_watcher = (t: number) => {
    if (t === Tool.LABLE_CHANGE) {
        isLable.value = props.context.tool.isLable;
    }
}
const menu_watcher = (t: number) => {
    if (t === Menu.TOGGLE_PROTOTYPE) {
        if (currentTab.value === 'Design') {
            toggle('Prototype');
        } else {
            toggle('Design');
        }
    }
}

onMounted(() => {
    props.context.tool.watch(tool_watcher);
    props.context.menu.watch(menu_watcher);
    init();
    updateUnderlinePosition();
})
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
    props.context.menu.unwatch(menu_watcher);
})
</script>

<template>
    <div class="tab-container" v-if="isLable || !context.readonly">
        <template v-if="!isLable">
            <div ref="controllerRef" class="controller">
                <div v-for="(i, index) in tabs" :class="{ tab: true, active: currentTab === i.id }" :key="index"
                    :id="`tabs-id-${i.id}`" @click.stop="toggle(i.id)"
                    :style="{ color: currentTab === i.id ? '#000000' : '#333333' }">
                    {{ i.title }}
                </div>
                <div class="underline"
                    :style="{ width: underlineWidth + 'px', left: `${underlinePosition}px`, transform: `translateX(-50%)` }">
                </div>
            </div>
            <div class="body">
                <Design :context="props.context" v-if="currentTab === 'Design'" />
                <Prototype :context="props.context" v-if="currentTab === 'Prototype'" />
                <!-- <ResourceTab :context="props.context" v-if="currentTab === 'Inspect'"/> -->
            </div>
        </template>
        <div class="tab-lable" v-else>
            <Lable :context="context" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #EBEBEB;

    .controller {
        display: flex;
        height: 40px;
        position: relative;

        >.tab {
            cursor: pointer;
            padding: 13px 14px 13px 14px;
            font-size: 12px;
            font-weight: 400;
            color: #000000;
        }

        >.active {
            border-radius: 4px 4px 0 0;
            font-weight: 500;
        }

        .underline {
            background-color: #000000;
            border-radius: 292px;
            position: absolute;
            bottom: 0;
            box-sizing: border-box;
            height: 2px;
            z-index: 1;
        }
    }

    .body {
        border-top: 1px solid #F0F0F0;
        width: 100%;
        height: calc(100% - 36px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
    }
}

.tab-lable {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #fff;
}
</style>