<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { router } from '@/router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const emit = defineEmits<{
    (e: 'refreshDoc'): void
}>()
const props = defineProps<{
    top?: Boolean
}>()

const refreshDoc = () => {
    emit('refreshDoc')
}

onMounted(() => {  

})
onUnmounted(() => {

})
</script>

<template>
    <div class="header" v-if="top">
        <div class="svgBox" @click="() => { router.push({ name: 'apphome' }) }">
            <svg-icon class="svg" icon-class="home_0508"></svg-icon>
        </div>
        <div class="user-avatar">
            <img src="../assets/pd-logo-svg.svg">
        </div>
    </div>
    <div class="container">
        <div>
            <span v-if="top">{{t('message.doc_notopen')}}</span>
            <span v-else>{{t('message.list_for_failure')}}</span>
            <button class="button" @click="refreshDoc">{{t('message.retry')}}</button>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    z-index: 9999;
    font-size: var(--font-default-fontsize);
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    
    >div {
        display: flex;
        flex-direction: column;
        align-items: center;
        span {
            color: rgba(0, 0, 0, .75);
        }
    }
    .button {
        margin-top: 20px;
        font-size: var(--font-default-fontsize);
        width: 80px;
        border: none;
        height: 25px;
        background-color: var(--active-color);
        color: #fff;
        border: 1px solid var(--active-color);
        border-radius: 4px;
    }
}
.header {
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    background-color: var(--theme-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--theme-color-line);
    padding: 0 var(--default-margin);

    .svgBox {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;

        .svg {
            width: 80%;
            height: 80%;
            color: #fff;
        }
    }

    .user-avatar {
        cursor: pointer;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #fff;
        text-align: center;

        >img {
            width: 90%;
            height: 90%;
        }
    }
}
</style>