<script lang="ts" setup>
import { Fill, FillMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";

const {data, context, manager} = defineProps<{ context: Context; manager: FillContextMgr; data: FillMask; }>();

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

function showModifyPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
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
            <div class="content" @click="modifyFillMask">
                <ColorBlock :colors="fills as Fill[]" round disabled-alpha/>
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
        flex: 1;
        width: 50px;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 8px;
        box-sizing: border-box;
    }
</style>