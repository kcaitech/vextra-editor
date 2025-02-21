<script setup lang="ts">
import { Context } from '@/context';
import { StrokeFillContextMgr } from '../ctx';
import BorderDetail from './BorderDetail.vue';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
import thickness_icon from '@/assets/icons/svg/thickness.svg';
import SvgIcon from '@/components/common/SvgIcon.vue';

const props = defineProps<{ context: Context; manager: StrokeFillContextMgr; trigger: any[] }>();
const emits = defineEmits<{
    (e: 'showBorderPanel', event: MouseEvent): void;
}>();

const showBorderPanel = (event: MouseEvent) => {
    emits('showBorderPanel', event);
}
</script>

<template>
    <div class="borders-container" v-if="manager.fillCtx.fills.length && manager.fillCtx.strokeMaskInfo">
        <div class="bordermask">
            <div class="info">
                <div class="border-left" @click="showBorderPanel($event)">
                    <div class="border">
                        <SvgIcon :icon="thickness_icon" />
                    </div>
                    <div class="name">{{ manager.fillCtx.strokeMaskInfo.name }}</div>
                </div>
                <div class="unbind" @click.stop="manager.unbindStroke()">
                    <SvgIcon :icon="unbind_icon" />
                </div>
            </div>
        </div>
        <BorderDetail :context="context" :manager="manager" :trigger="trigger"></BorderDetail>
    </div>
</template>

<style scoped lang="scss">
.borders-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;

    .bordermask {
        flex: 1;
        display: flex;
        height: 32px;
        border-radius: 6px;
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        .info {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px;
            overflow: hidden;
            background-color: #f4f5f5;
            height: 100%;

            .border-left {
                flex: 1;
                display: flex;
                align-items: center;
                background-color: #F5F5F5;
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

                    >img {
                        width: 14px;
                        height: 16px;
                    }
                }
            }

            .unbind {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 32px;

                >img {
                    width: 16px;
                    height: 16px;
                }
            }

            .unbind:hover {
                background-color: #e5e5e5;
            }
        }
    }
}
</style>