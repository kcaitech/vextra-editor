<script lang="ts" setup>
import { Shadow, ShadowMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ModifyShadowStyle from "@/components/Document/Attribute/Shadow2/Lib/ModifyShadowMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { ShadowsContextMgr } from "../ctx";

/**
 * 用于展示样式表中单个样式的组件
 * data: 样式信息
 * 该组件除了展示样式基本信息之外，可以点击把该样式绑定到图层上、修改该样式
 */
const { data, context, manager } = defineProps<{ context: Context; manager: ShadowsContextMgr; data: ShadowMask; }>();

const name = ref<string>(data.name);
const shadows = ref<Shadow[]>(data.shadows.map(i => i));
const selected = ref<boolean>(manager.shadowCtx.mask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-shadow-style-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-shadow-style-panel', '.modify'] }
);

function update() {
    name.value = data.name;
    shadows.value = data.shadows.map(i => i);
    selected.value = manager.shadowCtx.mask === data.id;
}

function showModifyPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('modify')) {
            modifyPanelStatusMgr.showBy(e, { once: { offsetLeft: -442 } });
            manager.keepUniquePanel('.modify', modifyPanelStatusMgr);
            break;
        }
        e = e.parentElement;
    }
}

function modifyShadowMask() {
    manager.modifyShadowMask(data.id);
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
    <PanelItem :extend="modifyPanelStatus.visible" :selected="selected" @modify="showModifyPanel">
        <template #preview>
            <div class="content" @click="modifyShadowMask">
                <div class="effect" :style="{
                    boxShadow: `
                                    ${shadows![0].position.includes('in') ? 'inset' : ''} 
                                    ${shadows![0].offsetX > 0 ? '1px' : shadows![0].offsetX < 0 ? '-1px' : '0'} 
                                    ${shadows![0].offsetY > 0 ? '1px' : shadows![0].offsetY < 0 ? '-1px' : '0'} 
                                    ${shadows![0].blurRadius > 0 ? '1px' : '0'}
                                    ${shadows![0].spread > 0 ? '1px' : '0'}
                                    #0000004d
                                    `}">
                </div>
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyShadowStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
                @close="() => modifyPanelStatusMgr.close()" />
        </template>
    </PanelItem>
</template>
<style scoped lang="scss">
.content {
    flex: 1;
    width: 50px;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 8px;
    box-sizing: border-box;

    .effect {
        width: 14px;
        height: 14px;
        background-color: #fff;
        border: 1px solid #000000e5;
        border-radius: 3px;
        overflow: hidden;
    }
}
</style>