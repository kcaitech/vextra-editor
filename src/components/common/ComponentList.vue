<script lang="ts" setup>
import { ref } from 'vue';
import { Search, Grid } from '@element-plus/icons-vue';

const props = defineProps<{
    heard?: boolean
}>()
const emit = defineEmits<{
    (e: 'close'): void;
}>()
const search = ref('');
const isList = ref('list');

const close = () => {
    emit('close');
}
</script>

<template>
    <div class="container">
        <div class="header" v-if="heard">
            <span class="title">组件</span>
            <div class="close">
                <svg-icon icon-class="close" @click.stop="close"></svg-icon>
            </div>
        </div>
        <div class="search_togger">
            <el-input v-model="search" class="w-50 m-2" placeholder="搜索组件" :prefix-icon="Search" />
            <div class="toggle_list">
                <svg-icon v-if="isList === 'card'" icon-class="resource"  @click.stop="isList = 'list'"></svg-icon>
                <svg-icon v-if="isList === 'list'" icon-class="text-bulleted-list" @click.stop="isList = 'card'"></svg-icon>
            </div>
        </div>
        <div class="body" :style="{height: heard? 'calc(100% - 80px)': 'calc(100% - 35px)'}">
            <slot :type="isList"></slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    height: 100%;
    // display: flex;
    // flex-direction: column;
    min-width: 250px;
    padding: var(--default-padding-half);
    padding-right: 0;
    font-size: var(--font-default-fontsize);
    box-sizing: border-box;
    .header {
        width: 100%;
        height: 32px;
        border-bottom: 1px solid var(--grey-light);
        display: flex;
        box-sizing: border-box;
        align-items: center;
        margin-bottom: 10px;

        .title {
            line-height: 32px;
            font-weight: var(--font-default-bold);
        }

        .close {
            width: 24px;
            height: 24px;
            position: absolute;
            right: var(--default-padding-half);
            display: flex;
            align-items: center;
            justify-content: center;

            >svg {
                width: 65%;
                height: 65%;
            }
        }
    }
    .search_togger {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 28px;
        margin-bottom: 10px;
        .el-input {
            height: 28px;
            font-size: 10px;
            line-height: 28px;
            
            :deep(.el-input__wrapper) {
                background-color: var(--grey-light);
            }
            :deep(.el-input__wrapper.is-focus) {
                box-shadow: 0 0 0 1px var(--active-color) inset !important;
            }
        }
        .toggle_list {
            width: 28px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            svg {
                width: 16px;
                height: 16px;
            }
        }
    }
    .body {
        box-sizing: border-box;
    }
}
</style>