/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import ShapeTab from "@/components/Document/Navigation/ShapeTab.vue";
import CompsTab from "@/components/Document/Navigation/CompsTab.vue";
import { useI18n } from 'vue-i18n';
import { PageView } from "@kcdesign/data";
import { Tool } from "@/context/tool";
import { Navi } from "@/context/navigate";

const { t } = useI18n();

interface Props {
    context: Context
    page: PageView
}

const props = defineProps<Props>();
const controllerRef = ref<HTMLElement>();
const underlineWidth = ref(0);
const underlinePosition = ref(0);
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
type Tab = "Shape" | "Comps" | "Resource" | "Comment";
const plugins = props.context.pluginsMgr.search2('navigation');

const currentTab = ref<Tab>("Shape");
const tabs: { title: string, id: Tab }[] = [
    {
        title: t('navi.shape'),
        id: 'Shape'
    }, {
        title: t('navi.comps'),
        id: 'Comps'
    }
]

if (plugins.end.length) {
    tabs.push({
        title: t('home.comment'),
        id: 'Comment'
    })
}

function toggle(id: Tab) {
    currentTab.value = id;
    props.context.navi.set_current_navi_module(id);
    updateUnderlinePosition();
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

const showHiddenLeft = () => {
    emit('showNavigation')
}
const tool_watch = (t: number) => {
    if (t === Tool.COMPONENT) {
        // if (!props.showLeft) showHiddenLeft(); // todo
        currentTab.value = 'Comps';
        props.context.navi.set_current_navi_module(currentTab.value);
        updateUnderlinePosition();
    }
}

const navi_watch = (t: number) => {
    if (t === Navi.MODULE_CHANGE) {
        currentTab.value = props.context.navi.current_navi_module;
        updateUnderlinePosition();
    }
}


onMounted(() => {
    props.context.navi.set_current_navi_module(currentTab.value);
    props.context.tool.watch(tool_watch);
    props.context.navi.watch(navi_watch);
    updateUnderlinePosition();
});
onUnmounted(() => {
    props.context.tool.unwatch(tool_watch);
    props.context.navi.watch(navi_watch);
})

</script>

<template>
<div class="tab-container">
    <div ref="controllerRef" class="controller">
        <div v-for="(i, index) in tabs" :class="{ tab: true, active: currentTab === i.id }" :key="index"
             :id="`tabs-id-${i.id}`" @click="toggle(i.id)"
             :style="{ color: currentTab === i.id ? '#000000' : '#434343' }">
            {{ i.title }}
        </div>
        <div class="underline"
             :style="{ width: underlineWidth + 'px', left: `${underlinePosition}px`, transform: `translateX(-50%)` }">
        </div>
    </div>
    <div class="body">
        <!-- begin plugin -->
        <component v-for="p in plugins.begin" :is=p.component :context="props.context" :params="p.params"/>
        <ShapeTab :context="props.context" v-show="currentTab === 'Shape'" v-bind="$attrs" :page="page"/>
        <CompsTab :context="props.context" v-show="currentTab === 'Comps'"/>
        <!-- end plugin -->
        <component v-for="p in plugins.end" :is=p.component :context="props.context" :params="p.params"/>
    </div>
</div>
</template>

<style scoped lang="scss">
.tab-container {
    position: relative;
    width: 100%;
    height: 100%;
    border-right: 1px solid #EBEBEB;
    box-sizing: border-box;

    .controller {
        display: flex;
        height: 40px;
        position: relative;
        overflow: hidden;

        > .tab {
            cursor: pointer;
            padding: 13px 14px 13px 14px;
            font-size: 12px;
            font-weight: 400;
            color: #000000;
        }

        > .active {
            border-radius: 4px 4px 0 0;
            font-weight: 500;
        }

        .underline {
            background-color: #000000;
            border-radius: 292px;
            position: absolute;
            bottom: 0;
            // transition: left 0.3s ease-in-out;
            box-sizing: border-box;
            height: 2px;
            z-index: 1;
        }
    }

    .body {
        border-top: 1px solid #F0F0F0;
        width: 100%;
        height: calc(100% - 40px);
        position: relative;
        flex: 1 1 auto;
        box-sizing: border-box;
        box-shadow: inset 0px -1px 0px 0px #F0F0F0;
    }

}
</style>