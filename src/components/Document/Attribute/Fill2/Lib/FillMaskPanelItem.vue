<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import editor_icon from "@/assets/icons/svg/export-menu.svg";

import { Fill, FillMask } from "@kcdesign/data";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import ColorBlock from "@/components/common/ColorBlock/Index.vue"
import ModifyFillStyle from "@/components/Document/Attribute/Fill2/Lib/ModifyFillStyle.vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";

const {data, context, manager} = defineProps<{ context: Context; manager: FillContextMgr; data: FillMask; }>();

const name = ref<string>(data.name);
const fills = ref<Fill[]>(data.fills.map(i => i));

const modifyPanelStatus = reactive<ElementStatus>({id: '#modify-fill-style-panel', visible: false});
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    {whiteList: ['.modify-fill-style-panel', '.modify']}
);

function update() {
    name.value = data.name;
    fills.value = data.fills.map(i => i);
}

function showModifyPanel(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('modify')) {
            e && modifyPanelStatusMgr.showBy(e, {once: {offsetLeft: -462}});
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
    <div :class="{'fill-mask-catch-wrapper': true, extend: modifyPanelStatus.visible }">
        <div class="content" @click="modifyFillMask">
            <ColorBlock :colors="fills as Fill[]" round disabled-alpha/>
            <span>{{ name }}</span>
        </div>
        <div class="modify" style="visibility: hidden;" @click="showModifyPanel">
            <SvgIcon :icon="editor_icon"/>
        </div>
        <ModifyFillStyle v-if="modifyPanelStatus.visible" :context="context"
                         @close="() => modifyPanelStatusMgr.close()"/>
    </div>
</template>
<style scoped lang="scss">
.fill-mask-catch-wrapper {
    width: 100%;
    height: 32px;
    border-radius: var(--default-radius);
    display: flex;
    align-items: center;
    overflow: hidden;

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

    .modify {
        flex: 0 0 32px;
        display: flex;
        width: 32px;
        height: 100%;

        &:hover {
            background-color: #e5e5e5;
        }

        img {
            outline: none;
            margin: auto;
            width: 16px;
            height: 16px;
        }
    }

    &:hover {
        background-color: var(--input-background);

        .modify {
            visibility: visible !important;
        }
    }
}

.extend {
    background-color: var(--input-background) !important;

    .modify {
        background-color: #e5e5e5;
        visibility: visible !important;
    }
}
</style>