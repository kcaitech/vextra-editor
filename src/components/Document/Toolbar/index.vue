<script setup lang="ts">
import { defineProps, shallowRef } from "vue"
import { Context } from '@/context';
import Home from "./BackToHome.vue";
import EditorTools from "./EditorTools.vue";
import UserInfo from './UserInfo.vue';
const props = defineProps<{ context: Context }>();
const selection = shallowRef(props.context.selection);
</script>

<template>
    <div class="toolbar">
        <Home :context="props.context"></Home>
        <EditorTools :context="context" :selection="selection"></EditorTools>
        <UserInfo :context="props.context"></UserInfo>
    </div>
</template>

<style scoped>
.toolbar {
    width: 100%;
    height: 100%;
    min-width: 700px;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0px 8px;
}
</style>