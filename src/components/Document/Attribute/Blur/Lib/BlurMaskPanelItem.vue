<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { Context } from "@/context";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import PanelItem from "@/components/Document/Attribute/StyleLib/PanelItem.vue";
import { BlurMask } from "@kcdesign/data";

const {data, context} = defineProps<{ context: Context, data: BlurMask; }>();

const name = ref<string>(data.name);

const modifyPanelStatus = reactive<ElementStatus>({id: '#modify-fill-style-panel', visible: false});
const modifyPanelStatusMgr = new ElementManager(
    context,
    modifyPanelStatus,
    {whiteList: ['.modify-fill-style-panel', '.modify']}
);

function update() {
    name.value = data.name;

}

function showModifyPanel() {
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
    <PanelItem :extend="modifyPanelStatus.visible" :selected="false" @modify="showModifyPanel">
        <template #preview>
            <div class="content">
                <span>{{ name }}</span>
            </div>
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