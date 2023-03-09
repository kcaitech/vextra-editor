<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-09 11:26:27
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 15:22:20
-->
<script setup lang="ts">
import { defineProps } from "vue";
import { Context } from "@/context";
const props = defineProps<{ context: Context }>();

</script>

<template>
    <div class="resource-container">
        资源库...
    </div>
</template>

<style scoped lang="scss">
.resource-container {
    width: 100%;
    height: 100%;
    background-color: rgb(242, 252, 231);
    font-size: 10px;
    padding: 8px 16px;
}
</style>