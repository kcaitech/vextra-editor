<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{
    saveSuccess?: boolean
    networkSuccess?: boolean
    networkError?: boolean
    netError?: boolean
}>()

</script>

<template>
    <div class="network_error_message" v-if="networkError">
        <span style="margin-right: 10px;">{{ t('massage.network_error') }}</span>
        <div class="loading-spinner"><svg-icon icon-class="network-loading"></svg-icon></div>
    </div>
    <div class="network_error_message" v-else-if="saveSuccess">
        <span>{{t('massage.autosave')}}</span>
    </div>
    <div class="network_error_message" v-if="networkSuccess">
        <span>{{t('massage.link_success')}}</span>
    </div>
    <div class="network_error_message" v-if="netError">
        <span>{{t('massage.network_anomaly')}}</span>
    </div>
</template>

<style lang="scss" scoped>
.network_error_message {
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
}</style>