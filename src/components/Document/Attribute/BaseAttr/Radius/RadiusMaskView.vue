<script setup lang="ts">
import { Context } from '@/context';
import { RadiusContextMgr } from './ctx';
import unbind_icon from '@/assets/icons/svg/unbind.svg';
import radius_icon from "@/assets/icons/svg/radius.svg";
import SvgIcon from '@/components/common/SvgIcon.vue';

const props = defineProps<{ context: Context; manager: RadiusContextMgr }>();
const emits = defineEmits<{
    (e: 'showRadiusPanel', event: MouseEvent): void;
}>();

const showRadiusPanel = (event: MouseEvent) => {
    emits('showRadiusPanel', event);
}
</script>

<template>
    <div class="radius-container" v-if="manager.radiusCtx.maskInfo">
        <div class="radiusmask">
            <div class="info">
                <div class="radius-left" @click="showRadiusPanel($event)">
                    <div class="radius">
                        <SvgIcon :icon="radius_icon" />
                    </div>
                    <div class="name">{{ manager.radiusCtx.maskInfo.name }}</div>
                </div>
                <div class="unbind" @click.stop="manager.unbind()">
                    <SvgIcon :icon="unbind_icon" />
                </div>
            </div>
        </div>
        <div style="width: 32px;height: 32px;"></div>
    </div>
</template>

<style scoped lang="scss">
.radius-container {
    display: flex;
    align-items: center;
    gap: 8px;

    .radiusmask {
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

            .radius-left {
                flex: 1;
                display: flex;
                align-items: center;
                background-color: #F5F5F5;
                height: 100%;

                &:hover {
                    background-color: #e5e5e5;
                }

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