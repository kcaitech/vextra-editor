<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { TextMask, TextAttr } from "@kcdesign/data";
import { TextContextMgr } from "../ctx";
import ModifyTextMaskPanel from "../lib/ModifyTextMaskPanel.vue";


const { data, context, manager } = defineProps<{
    context: Context;
    manager: TextContextMgr;
    data: TextMask;
}>();
const emits = defineEmits<{
    (e: 'update'): void;
}>();

const name = ref<string>(data.name);

const modifyPanelStatus = reactive<ElementStatus>({ id: '#modify-text-panel', visible: false });
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    { whiteList: ['#modify-text-panel', '.modify']}
);
const selected = ref<boolean>(manager.textCtx.mask === data.id);

function update(...args: any[]) {
    if (args?.includes('disabled')) emits('update');
    name.value = data.name;
    selected.value = manager.textCtx.mask === data.id;
    console.log(data.id);
    
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

}
function disable() {

}
onMounted(() => {
    console.log(data,'data');
    
    // data.watch(update);
})
onUnmounted(() => {
    // data.unwatch(update);
    modifyPanelStatusMgr.unmounted();
})

import SvgIcon from "@/components/common/SvgIcon.vue";
import background from "@/assets/icons/svg/background_blur.svg";
import gaussian from "@/assets/icons/svg/gaussian_blur.svg";

</script>
<template>
    <PanelItem :context="context" :extend="modifyPanelStatus.visible" :selected="selected" @modify="showModifyPanel"
        @disable="disable">
        <template #preview>
            <div class="content" @click="modify">
                <div class="blur">
                    <SvgIcon :icon="gaussian"></SvgIcon>
                </div>
                <span>{{ name }}</span>
            </div>
        </template>
        <template #modal>
            <ModifyTextMaskPanel v-if="modifyPanelStatus.visible" :context="context" :manager="manager" :data="data"
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

    .blur {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            width: 100%;
            height: 100%;
        }
    }

    span {
        display: block;
        width: 132px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>