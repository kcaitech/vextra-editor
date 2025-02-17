<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Context } from '@/context';
import { Blur, ShapeView } from "@kcdesign/data";
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import BlurStyle from '@/components/Document/Attribute/Blur/Lib/BlurStyle.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import add_icon from '@/assets/icons/svg/add.svg';
import style_icon from '@/assets/icons/svg/styles.svg';
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { BlurCatch, BlurContext, BlurContextMgr } from "@/components/Document/Attribute/Blur/ctx";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";
import BlurPanel from "@/components/Document/Attribute/Blur/BlurPanel.vue"

type Props = {
    context: Context;
    shapes: ShapeView[];
    selectionChange: number;
    trigger: any[];
}
const props = defineProps<Props>();
const {t} = useI18n();
const blurCtx = ref<BlurContext>({
    mixed: false,
    blur: undefined,
    mask: undefined,
    maskInfo: undefined
})
const blurCtxMgr = new BlurContextMgr(props.context, blurCtx.value as BlurContext);
const cloverVisible = computed<boolean>(() => !(blurCtx.value.mask || blurCtx.value.mixed));
const blurLibStatus = reactive<ElementStatus>({id: '#blur-lib-panel', visible: false});
const blurPanelStatusMgr = new ElementManager(
    props.context,
    blurLibStatus,
    {whiteList: ['.blur_clover', '.blur-lib-panel', '.blur_desc']}
);
blurCtxMgr.catchPanel(blurPanelStatusMgr);

const active = computed<boolean>(() => !!(blurCtx.value.mask || blurCtx.value.blur));

const showBlurPanel = (event: MouseEvent) => {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('blur_desc')) {
            e && blurPanelStatusMgr.showBy(e, {once: {offsetLeft: -4, offsetTop: 42}});
            break;
        }
        if (e.classList.contains('blur_clover')) {
            e && blurPanelStatusMgr.showBy(e, {once: {offsetLeft: -164, offsetTop: 42}});
            break;
        }
        e = e.parentElement;
    }
}

const closePanel = () => {
    blurPanelStatusMgr.close();
}

const watchList: any[] = [
    watch(() => props.selectionChange, () => blurCtxMgr.update()),
    watch(() => props.trigger, v => v?.includes('style') && blurCtxMgr.update())
]
onMounted(() => {
    blurCtxMgr.update();
});
onUnmounted(() => {
    watchList.forEach(stop => stop());
    blurPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="blur-panel" ref="blurPanelTrigger">
        <TypeHeader :title="t('blur.blur')" @click="() => blurCtxMgr.init()" :active="active">
            <template #tool>
                <div v-if="cloverVisible" class="blur_clover" @click="showBlurPanel($event)">
                    <SvgIcon :icon="style_icon"/>
                </div>
                <div v-if="!blurCtx.blur || blurCtx.mixed" class="add" @click.stop="() => blurCtxMgr.create()">
                    <SvgIcon :icon="add_icon"/>
                </div>
            </template>
        </TypeHeader>
        <div v-if="blurCtx.mixed" class="tips-wrapper">{{ t('attr.mixed_lang') }}</div>
        <MaskPort v-else-if="blurCtx.maskInfo" @unbind="() => blurCtxMgr.unbind()"
                  @delete="() => blurCtxMgr.removeMask()">
            <div class="blur_desc" @click="showBlurPanel($event)">
                <div class="effect"/>
                <div>{{ blurCtx.maskInfo.name }}</div>
            </div>
        </MaskPort>
        <BlurPanel v-else-if="blurCtx.blur" :manager="blurCtxMgr" :context="context" :blur="(blurCtx.blur as BlurCatch)"/>
        <BlurStyle v-if="blurLibStatus.visible" :context="props.context" :manager="blurCtxMgr"
                   @close="closePanel"/>
    </div>
</template>
<style scoped lang="scss">
.blur-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;
    gap: 8px;

    .tips-wrapper {
        padding: 12px 0;
        color: #737373;
        text-align: center;
        font-size: var(--font-default-fontsize);
    }

    .add, .blur_clover {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        > img {
            width: 16px;
            height: 16px;
        }
    }

    .blur_clover img {
        padding: 2px;
        box-sizing: border-box;
    }

    .blur_clover:hover {
        background-color: #F5F5F5;
    }

    .add:hover {
        background-color: #F5F5F5;
    }

    .blur_desc {
        flex: 1;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px;

        .effect {
            width: 16px;
            height: 16px;
            background-color: #fff;
            border: 1px solid #000000e5;
            border-radius: 3px;
            overflow: hidden;
        }

        .span {
            display: inline-block;
            flex: 1;
            width: 32px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>