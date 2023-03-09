<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-09 11:26:27
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 15:27:56
-->
<script setup lang="ts">
import { defineProps } from "vue";
import { Context } from "@/context";
const props = defineProps<{ context: Context }>();

</script>

<template>
    <div class="comps-container">
        组件库...
    </div>
</template>

<style scoped lang="scss">
.comps-container {
    width: 100%;
    height: 100%;
    background-color: rgb(248, 239, 229);
    font-size: 10px;
    padding: 8px 16px;
}
</style>