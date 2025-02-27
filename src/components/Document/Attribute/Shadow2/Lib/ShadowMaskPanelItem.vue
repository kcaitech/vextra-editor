<script lang="ts" setup>
import { Shadow, ShadowMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ModifyShadowStyle from "@/components/Document/Attribute/Shadow2/Lib/ModifyShadowMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { ShadowsContextMgr } from "../ctx";

const { data, context, manager } = defineProps<{ context: Context; manager: ShadowsContextMgr; data: ShadowMask; }>();

const emits = defineEmits<{
    (e: 'update'): void;
}>();

const name = ref<string>(data.name);
const shadows = ref<Shadow[]>(data.shadows.map(i => i));
const selected = ref<boolean>(manager.shadowCtx.mask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-shadow-style-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-shadow-style-panel', '.modify'], level: 1 }
);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    shadows.value = data.shadows.map(i => i);
    selected.value = manager.shadowCtx.mask === data.id;
}

function showModifyPanel(trigger: MouseEvent | Element) {
    let e: Element | null = trigger instanceof Element ? trigger : trigger.target as Element;
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
    if (selected.value) return;
    manager.modifyShadowMask(data.id);
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
    width: 100%;
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

    > span {
        display: block;
        width: 132px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>