<script lang="ts" setup>
import { Fill, FillMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";

/**
 * 用于展示样式表中单个样式的组件
 * data: 样式信息
 * 该组件除了展示样式基本信息之外，可以点击把该样式绑定到图层上、修改该样式
 */
const {data, context, manager} = defineProps<{ context: Context; manager: FillsContextMgr; data: FillMask; }>();

const name = ref<string>(data.name);
const fills = ref<Fill[]>(data.fills.map(i => i));
const selected = ref<boolean>(manager.fillCtx.mask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({id: '#modify-fill-style-panel', visible: false});
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    {whiteList: ['.modify-fill-style-panel', '.modify']}
);

function update() {
    name.value = data.name;
    fills.value = data.fills.map(i => i);
    selected.value = manager.fillCtx.mask === data.id;
}

function showModifyPanel(trigger: MouseEvent | Element) {
    let e: Element | null = trigger instanceof Element ? trigger : trigger.target as Element;
    while (e) {
        if (e.classList.contains('modify')) {
            modifyPanelStatusMgr.showBy(e, {once: {offsetLeft: -442}});
            manager.keepUniquePanel('.modify', modifyPanelStatusMgr);
            break;
        }
        e = e.parentElement;
    }
}

function modifyFillMask() {
    manager.modifyFillMask(data.id);
}

function disable() {
    manager.disableMask(data);
}

onMounted(() => {
    data.watch(update);
})
onUnmounted(() => {
    data.unwatch(update);
    modifyPanelStatusMgr.unmounted();
})
</script>
<template>
    <PanelItem :context="context" :extend="modifyPanelStatus.visible" :selected="selected"
               @modify="showModifyPanel" @disable="disable">
        <template #preview>
            <div class="content" @click="modifyFillMask">
                <ColorBlock :colors="(fills as Fill[])" round disabled-alpha/>
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyFillStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
                         @close="() => modifyPanelStatusMgr.close()"/>
        </template>
    </PanelItem>
</template>
<style scoped lang="scss">
    .content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 8px;
        box-sizing: border-box;
    }
</style>