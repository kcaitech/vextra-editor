<script setup lang="ts">
import { Context } from '@/context';
import BackToHome from "./PreviewBackToHome.vue";
import UserInfo from './PreviewUserInfo.vue';
const props = defineProps<{ context: Context }>();
</script>

<template>
    <div class="toolbar">
        <BackToHome :context="props.context"></BackToHome>
        <UserInfo :context="props.context"></UserInfo>
    </div>
</template>

<style scoped>
.toolbar {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 960px
}
</style>