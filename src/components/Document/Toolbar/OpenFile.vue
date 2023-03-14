<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-27 14:36:23
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 09:41:26
 * @FilePath: \kcdesign\src\components\Document\Toolbar\OpenFile.vue
-->
<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

function onclick() {}

</script>

<template>
    <div class="temp" title="new file">
        <svg-icon icon-class="frame"></svg-icon>
    </div>
    <ToolButton :onclick="onclick" :valid="true" :selected="false">
        <span>{{ t('home.new_file') }}</span>
    </ToolButton>
</template>

<style scoped lang="scss">
    .temp {
        cursor: pointer;
        width: 28px;
        height: 28px;
        font-size: 12px;
        color: #ffffff;
        box-sizing: border-box;
        padding: 4px;
        > svg {
            width: 100%;
            height: 100%;
        }
    }
</style>