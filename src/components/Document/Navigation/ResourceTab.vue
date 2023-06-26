<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-09 11:26:27
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 15:22:20
-->
<script setup lang="ts">
import {} from "vue";
import { Context } from "@/context";
import developing from "@/assets/development.svg"
import { useI18n } from 'vue-i18n';

const props = defineProps<{ context: Context }>();
const { t } = useI18n();
</script>

<template>
    <div class="resource-container">
        <img :src="developing" alt="">
        <span class="text">{{t('navi.development')}}</span>
    </div>
</template>

<style scoped lang="scss">
.resource-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-size: 10px;
    padding: 8px 16px;
    box-sizing: border-box;
    >img {
        width: 100%;
    }
    .text {
        position: relative;
        top: -30px;
    }
}
</style>