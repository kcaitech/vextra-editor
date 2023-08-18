<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue'
const { t } = useI18n();
const props = defineProps<{
    context: Context
}>()
const emit = defineEmits<{
    (e: 'close'): void
}>()

const popoverClose = () => {
    emit('close')
}
</script>

<template>
    <div class="compLayer-container" tabindex="-1">
        <div class="popover" ref="popover">
            <div class="header">
                <span class="title">图层是否显示</span>
                <div @click="popoverClose" class="close">
                    <svg-icon icon-class="close"></svg-icon>
                </div>
            </div>
            <div class="body"></div>
        </div>
  </div>
</template>

<style lang="scss" scoped>
.compLayer-container {
    position: relative;
    outline: none;
    z-index: 99;
    .popover {
        position: absolute;
        width: 360px;
        height: 300px;
        outline: none;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
        background-color: #ffffff;
        z-index: 1;
        border-radius: 4px;
        .header {
            width: 100%;
            height: 32px;
            border-bottom: 1px solid var(--grey-light);
            display: flex;
            font-size: var(--font-default-fontsize);
            padding: 0 var(--default-padding);
            box-sizing: border-box;
            align-items: center;

            >.title {
                line-height: 32px;
                font-weight: var(--font-default-bold);
            }

            >.close {
                width: 24px;
                height: 24px;
                position: absolute;
                right: var(--default-padding);
                display: flex;
                align-items: center;
                justify-content: center;

                >svg {
                width: 65%;
                height: 65%;
                }
            }
        }
        .body {
            width: 100%;
            height: calc(100% - 32px);
            font-size: 10px;
            position: relative;
        }
    }
}
</style>