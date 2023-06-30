<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { router } from '@/router';
const { t } = useI18n();
function home() {
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    router.push({ name: 'recently' });
}
</script>

<template>
    <div class="container">
        <div class="home" title="new file" @click="home">
            <svg-icon icon-class="home_0508"></svg-icon>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
    width: 42px;
    justify-content: space-around;

    .home {
        cursor: pointer;
        width: 28px;
        height: 28px;
        font-size: 12px;
        color: #ffffff;
        box-sizing: border-box;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-items: center;
        margin-top: 4px;

        >svg {
            width: 88%;
            height: 88%;
        }
    }

}
</style>