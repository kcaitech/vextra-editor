<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-02-28 10:10:14
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 16:43:27
 * @FilePath: \kcdesign\src\components\Document\Toolbar\UserAvatar.vue
-->
<script setup lang="ts">
import avatar from '@/assets/pd-logo-svg.svg';
import {} from "vue";

const props = defineProps<{ user: string }>();

</script>

<template>
    <div class="user-avatar">
        <img :src="avatar" :alt="props.user ? props.user : ''">
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
        width: 90%;
        height: 90%;
    }
}
</style>