<script lang="ts" setup>
import SvgIcon from "@/components/common/SvgIcon.vue";
import style_icon from "@/assets/icons/svg/styles.svg";
import add_icon from "@/assets/icons/svg/add.svg";

import { Context } from "@/context";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { FillCatch, FillContext, FillContextMgr } from "@/components/Document/Attribute/Fill2/ctx";
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import FillMaskView from "@/components/Document/Attribute/Fill2/FillMaskView.vue";
import FillItem from "./FillItem.vue";
import { useI18n } from "vue-i18n";

type Props = {
    context: Context;
    selectionChange: number;
    trigger: any[];
}
const {t} = useI18n();

const props = defineProps<Props>();
const fillCtx = ref<FillContext>({
    mixed: false,
    fills: [],
    mask: undefined,
    maskInfo: undefined
});
const cloverVisible = computed<boolean>(() => !(fillCtx.value.mask || fillCtx.value.mixed));

const fillCtxMgr = new FillContextMgr(props.context, fillCtx.value as FillContext);

const watchList: any[] = [
    watch(() => props.selectionChange, () => fillCtxMgr.update()),
    watch(() => props.trigger, v => v?.includes('style') && fillCtxMgr.update())
];

onMounted(fillCtxMgr.update.bind(fillCtxMgr));
onUnmounted(() => watchList.forEach(stop => stop()));
</script>
<template>
    <div class="fills-wrapper">
        <TypeHeader :title="t('attr.fill')" :active="!!fillCtx.fills.length"
                    @click.stop="fillCtxMgr.init.bind(fillCtxMgr)">
            <template #tool>
                <div v-if="cloverVisible" class="clover">
                    <SvgIcon :icon="style_icon"/>
                </div>
                <div v-if="!fillCtx.mask" class="create" @click="() => fillCtxMgr.create()">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div v-if="fillCtx.mixed" class="tips-wrapper">
            {{ t('attr.mixed_lang') }}
        </div>
        <FillMaskView v-if="fillCtx.mask" :context="context" :manager="fillCtxMgr"
                      :fills="fillCtx.fills as FillCatch[]" :info="fillCtx.maskInfo!"/>
        <div v-if="!fillCtx.mixed && !fillCtx.mask" class="fills-container">
            <FillItem v-for="(fill, index) in fillCtx.fills" :key="index"
                      :context="context" :manager="fillCtxMgr" :data="fill as FillCatch"/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.fills-wrapper {
    width: 100%;
    height: fit-content;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .clover, .create {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--default-radius);
        transition: .2s;

        &:hover {
            background-color: #F5F5F5;
        }
    }

    .clover > img {
        width: 12px;
        height: 12px;
    }

    .create > img {
        width: 16px;
        height: 16px;
    }

    .tips-wrapper {
        padding: 12px 0;
        color: #737373;
        text-align: center;
        font-size: var(--font-default-fontsize);
    }

    .fills-container {
        display: flex;
        flex-direction: column;
        gap: 6px;

        width: 100%;
        height: fit-content;
        padding: 6px 0;
    }
}
</style>