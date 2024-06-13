<script setup lang="ts">
import { shallowRef } from "vue"
import { Context } from '@/context';
import Home from "./Home/index.vue";
import EditorTools from "./Tools/index.vue";
import UserInfo from './Others/index.vue';
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
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 960px
}
</style>