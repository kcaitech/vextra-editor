<script setup lang="ts">
import { Context } from "@/context";
import { BlurContextMgr } from "@/components/Document/Attribute/Blur/ctx";
import { BlurMask } from "@kcdesign/data";
import PanelHeader from "@/components/Document/Attribute/StyleLib/PanelHeader.vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import MaskBaseInfo from "@/components/Document/Attribute/StyleLib/MaskBaseInfo.vue";
import ListHeader from "@/components/Document/Attribute/StyleLib/ListHeader.vue";

const {context, manager, data} = defineProps<{
    context: Context;
    manager: BlurContextMgr;
    data?: BlurMask;
}>();
const emits = defineEmits<{
    (e: 'close'): void;
}>();
const {t} = useI18n();
const name = ref<string>(data?.name ?? '模糊样式');
const desc = ref<string>(data?.description ?? '');

function modifyName(value: string) {
    if (!data) return;
    manager.modifyMaskName(data.sheet, data.id, value);
}

function modifyDesc(value: string) {
    if (!data) return;
    manager.modifyMaskDesc(data.sheet, data.id, value);
}
</script>

<template>
    <div id="modify-blur-panel">
        <PanelHeader :title="data ? t('stylelib.editor_blur') : t('stylelib.create_blur')" @close="emits('close')"/>
        <MaskBaseInfo :name="name" :desc="desc" :focus-at-once="!data"
                      @modify-name="modifyName" @modify-desc="modifyDesc"/>
        <div v-if="data" class="data-panel">
            <ListHeader title="模糊" @create=""/>
        </div>
    </div>
</template>

<style scoped lang="scss">
#modify-blur-panel {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 250px;
    gap: 8px;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    box-sizing: border-box;

    .data-panel {
        width: 100%;
        height: fit-content;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
}
</style>