<script setup lang="ts">
import { Context } from '@/context';
import { RadiusContextMgr } from './ctx';
import radius_icon from "@/assets/icons/svg/radius.svg";
import SvgIcon from '@/components/common/SvgIcon.vue';
import { useI18n } from "vue-i18n";
import MaskPort from "@/components/Document/Attribute/StyleLib/MaskPort.vue";

defineProps<{
    context: Context;
    manager: RadiusContextMgr;
    active: boolean;
}>();
const emits = defineEmits<{
    (e: 'showRadiusPanel', event: MouseEvent): void;
}>();
const t = useI18n().t;

const showRadiusPanel = (event: MouseEvent) => {
    emits('showRadiusPanel', event);
}
</script>

<template>
    <MaskPort :disabled="manager.radiusCtx.maskInfo!.disabled" :delete="false" :active="active" style="width: 184px;"
              @unbind="() => manager.unbind()">
        <div class="radius-left" @click="showRadiusPanel($event)">
            <div class="radius">
                <SvgIcon :icon="radius_icon" />
            </div>
            <div class="name">{{
                manager.radiusCtx.maskInfo!.disabled ? t('stylelib.deleted_style') : manager.radiusCtx.maskInfo!.name
                }}
            </div>
        </div>
    </MaskPort>
</template>

<style scoped lang="scss">
.radius-left {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;

    .radius {
        margin: 0 8px;
        width: 16px;
        height: 16px;
        overflow: hidden;
        box-sizing: border-box;

        >img {
            width: 14px;
            height: 16px;
        }
        .name {
            flex: 0 0 116px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>