<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { BlurMask } from "@kcdesign/data";
import { BlurContextMgr } from "@/components/Document/Attribute/Blur/ctx";
import ModifyBlurMaskPanel from "@/components/Document/Attribute/Blur/Lib/ModifyBlurMaskPanel.vue";

const {data, context, manager} = defineProps<{
    context: Context;
    manager: BlurContextMgr;
    data: BlurMask;
}>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();

const name = ref<string>(data.name);

const modifyPanelStatus = reactive<ElementStatus>({id: '#modify-blur-panel', visible: false});
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['#modify-blur-panel', '.modify'], level: 1 }
);
const selected = ref<boolean>(manager.blurCtx.mask === data.id);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    selected.value = manager.blurCtx.mask === data.id;
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

function modify() {
    if (selected.value) return;
    manager.modifyBlurMask(data.id);
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
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyBlurMaskPanel v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
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
    > span {
        display: block;
        width: 132px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>