<script lang="ts" setup>
import { RadiusMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ModifyRadiusStyle from "./ModifyRadiusMaskPanel.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { RadiusContextMgr } from "../ctx";
import radius_icon from '@/assets/icons/svg/radius.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 用于展示样式表中单个样式的组件
 * data: 样式信息
 * 该组件除了展示样式基本信息之外，可以点击把该样式绑定到图层上、修改该样式
 */
const { data, context, manager } = defineProps<{ context: Context; manager: RadiusContextMgr; data: RadiusMask; }>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();
const name = ref<string>(data.name);
const selected = ref<boolean>(manager.radiusCtx.mask === data.id);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-radius-style-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['.modify-radius-style-panel', '.modify'], level: 1 }
);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    selected.value = manager.radiusCtx.mask === data.id;
}

function showModifyPanel(trigger: MouseEvent | Element) {
    let e: Element | null = trigger instanceof Element ? trigger : trigger.target as Element;
    while (e) {
        if (e.classList.contains('mask-catch-wrapper')) {
            modifyPanelStatusMgr.showBy(e, { once: { offsetLeft: -262 } });
            break;
        }
        e = e.parentElement;
    }
}

function modify() {
    if (selected.value) return;
    manager.addRadiusMask(data.id);
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
            <div class="content" @click="modify">
                <SvgIcon :icon="radius_icon" />
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyRadiusStyle v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
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

    >img {
        width: 14px;
        height: 16px;
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