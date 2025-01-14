<script lang="ts" setup>
import ColorStyle from "@/components/Document/Attribute/Fill2/Lib/ColorStyle.vue";
import { Context } from "@/context";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillStyle.vue";
import { onUnmounted, reactive } from "vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";

const props = defineProps<{ context: Context }>();
const emits = defineEmits<{ (e: "close"): void; }>();
const panelStatus = reactive<ElementStatus>({id: '#modify-fill-style-panel', visible: false});
const panelStatusMgr = new ElementManager(
    props.context,
    panelStatus,
    {whiteList: ['.modify-fill-style-panel', '.add']}
);

function showCreatePanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('add')) {
            e && panelStatusMgr.showBy(e, {once: {offsetLeft: -442}});
            break;
        }
        e = e.parentElement;
    }
}

onUnmounted(() => {
    panelStatusMgr.unmounted();
});
</script>
<template>
    <div id="fill-style-lib-panel" class="fill-style-lib-panel">
        <PopoverHeader title="填充样式" @create="showCreatePanel" @close="emits('close')"/>
        <ColorStyle :context="context"/>
        <ModifyFillStyle v-if="panelStatus.visible" :context="context" @close="() => panelStatusMgr.close()"/>
    </div>
</template>
<style scoped lang="scss">
.fill-style-lib-panel {
    width: 250px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 9;
}
</style>