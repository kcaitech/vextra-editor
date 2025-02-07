<script lang="ts" setup>
import StrokeStyle from "./StrokeStyle.vue";
import { Context } from "@/context";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import CreateStrokeMaskPanel from "./ModifyStrokeMaskPanel.vue";
import { onUnmounted, reactive } from "vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { useI18n } from "vue-i18n";
import { StrokeFillContextMgr } from "../ctx";

/**
 * 填充样式库面板。用于展示样式列表、创建样式
 */
const { context, manager, title } = defineProps<{ context: Context, manager: StrokeFillContextMgr, title: string }>();
const emits = defineEmits<{ (e: "close"): void; }>();
const { t } = useI18n()
const panelStatus = reactive<ElementStatus>({ id: '#modify-stroke-style-panel', visible: false });
const panelStatusMgr = new ElementManager(
    context,
    panelStatus,
    { whiteList: ['.modify-stroke-style-panel', '.add'] }
);
manager.catchPanel(panelStatusMgr);

function showCreatePanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('add')) {
            e && panelStatusMgr.showBy(e, { once: { offsetLeft: -422 } });
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
    <div id="stroke-style-lib-panel" class="stroke-style-lib-panel">
        <PopoverHeader :title="title" @create="showCreatePanel" @close="emits('close')" />
        <StrokeStyle :context="context" :manager="manager" />
        <CreateStrokeMaskPanel v-if="panelStatus.visible" :context="context" :manager="manager"
            @close="() => panelStatusMgr.close()" />
    </div>
</template>
<style scoped lang="scss">
.stroke-style-lib-panel {
    width: 230px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 9;
}
</style>