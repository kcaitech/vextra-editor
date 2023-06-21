<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-28 10:10:14
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 16:43:27
 * @FilePath: \kcdesign\src\components\Document\Toolbar\UserAvatar.vue
-->
<script setup lang="ts">
import {} from "vue";
import { Context } from '@/context';

const props = defineProps<{ 
    context: Context
}>();

const avatar = localStorage.getItem('avatar') || ''
const name = localStorage.getItem('nickname') || ''
</script>

<template>
    <div class="user-avatar">
        <img :src="avatar" :alt="name">
    </div>
</template>

<style scoped lang="scss">
.user-avatar {
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #fff;
    text-align: center;

    >img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
}
</style>