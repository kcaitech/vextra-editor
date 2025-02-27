<script setup lang="ts">
import { Context } from '@/context';
import { StrokeFillContextMgr } from '../ctx';
import BorderDetail from './BorderDetail.vue';
import thickness_icon from '@/assets/icons/svg/thickness.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useI18n } from "vue-i18n";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";

defineProps<{ context: Context; manager: StrokeFillContextMgr; trigger: any[] }>();
const emits = defineEmits<{
    (e: 'showBorderPanel', event: MouseEvent): void;
}>();
const t = useI18n().t;
const showBorderPanel = (event: MouseEvent) => {
    emits('showBorderPanel', event);
}
</script>

<template>
    <div class="borders-container" v-if="manager.fillCtx.fills.length && manager.fillCtx.strokeMaskInfo">
        <MaskPort v-bind="$attrs" :delete="false" :disabled="manager.fillCtx.strokeMaskInfo.disabled"
                  @unbind="() => manager.unbindStroke()">
            <div class="border-left" @click="showBorderPanel($event)">
                <div class="border">
                    <SvgIcon :icon="thickness_icon"/>
                </div>
                <div class="name">{{
                        manager.fillCtx.strokeMaskInfo.disabled ? t('stylelib.deleted_style') : manager.fillCtx.strokeMaskInfo.name
                    }}
                </div>
            </div>
        </MaskPort>
        <BorderDetail :context="context" :manager="manager" :trigger="trigger"/>
    </div>
</template>

<style scoped lang="scss">
.borders-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;

    .border-left {
        flex: 1;
        display: flex;
        align-items: center;
        height: 100%;

        &:hover {
            background-color: #e5e5e5;
        }

        .border {
            margin: 0 8px;
            width: 16px;
            height: 16px;
            overflow: hidden;
            box-sizing: border-box;

            > img {
                width: 14px;
                height: 16px;
            }
        }
    }
}
</style>