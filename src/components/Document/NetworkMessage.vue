<script lang="ts" setup>
import { ref } from 'vue';
const props = defineProps<{
    saveSuccess?: boolean
    networkSuccess?: boolean
    networkError?: boolean
    netError?: boolean
}>()

</script>

<template>
    <div class="network_error" v-if="networkError">
        <span style="margin-right: 10px;">网络异常，请勿刷新页面或关闭文档，以免内容丢失，文档尝试保存中…</span>
        <div class="loading-spinner"><svg-icon icon-class="network-loading"></svg-icon></div>
    </div>
    <div class="network_error" v-else-if="saveSuccess">
        <span>文档自动保存成功</span>
    </div>
    <div class="network_error" v-if="networkSuccess">
        <span>网络连接成功</span>
    </div>
    <div class="network_error" v-if="netError">
        <span>网络连接失败</span>
    </div>
</template>

<style lang="scss" scoped>
.network_error {
    position: fixed;
    font-size: var(--font-default-fontsize);
    display: flex;
    align-items: center;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    color: #f1f1f1;
    background-color: var(--active-color-beta);
    padding: 7px 30px;
    border: 1px solid var(--active-color-beta);
    border-radius: 4px;
    .loading-spinner {
        >svg {
            width: 15px;
            height: 15px;
            color: #000;
        }
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
}
</style>