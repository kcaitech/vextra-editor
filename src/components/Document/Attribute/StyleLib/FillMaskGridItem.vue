<script lang="ts" setup>
import { Fill, FillMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillsContextMgr } from "@/components/Document/Attribute/Fill2/ctx";

/**
 * 用于展示样式表中单个样式的组件
 * data: 样式信息
 * 该组件除了展示样式基本信息之外，可以点击把该样式绑定到图层上、修改该样式
 */
const { data, context, manager } = defineProps<{ context: Context; manager: FillsContextMgr; data: FillMask; }>();

const name = ref<string>(data.name);
const fills = ref<Fill[]>(data.fills.map(i => i));
const selected = ref<boolean>(manager.fillCtx.mask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-fill-style-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-fill-style-panel', '.modify'] }
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
            modifyPanelStatusMgr.showBy(e, { once: { offsetLeft: -442 } });
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
    <div class="container" :class="{ selected: selected }">
        <div class="content" @click="modifyFillMask">
            <ColorBlock :colors="(fills as Fill[])" :size="22" round disabled-alpha />
        </div>
        <template>
            <ModifyFillStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
                @close="() => modifyPanelStatusMgr.close()" />
        </template>
    </div>
</template>
<style scoped lang="scss">
.container {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-sizing: border-box;

    &:hover {
        border: 2px solid rgba(0, 0, 0, 0.06);
    }

    .content {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.selected {
    border: 2px solid var(--active-color) !important;
}
</style>