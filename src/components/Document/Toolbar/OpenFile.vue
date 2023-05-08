<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-27 14:36:23
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 09:41:26
 * @FilePath: \kcdesign\src\components\Document\Toolbar\OpenFile.vue
-->
<script setup lang="ts">
import { defineProps } from 'vue';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { router } from '@/router';
const { t } = useI18n();
interface Props {
    context: Context
}
const props = defineProps<Props>();

function home() {
    window.document.title = t('product.name');
    (window as any).sketchDocument = undefined;
    (window as any).skrepo = undefined;
    router.push({ name: 'recently' });
}
</script>

<template>
    <div class="home" title="new file" @click="home">
        <svg-icon icon-class="home_0508"></svg-icon>
    </div>
    <span></span>
</template>

<style scoped lang="scss">
.home {
    cursor: pointer;
    width: 28px;
    height: 28px;
    font-size: 12px;
    color: #ffffff;
    box-sizing: border-box;
    padding: 4px;

    >svg {
        width: 100%;
        height: 100%;
    }
}
</style>