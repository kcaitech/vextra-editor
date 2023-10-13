<script lang="ts" setup>
import { Context } from "@/context";
import PlatformSelected from './PlatformSelected.vue';
import LableLayerInfo from "./LableLayerInfo.vue";
import LableFill from "./LableFill.vue";
import LableBorder from "./LableBorder.vue";
const props = defineProps<{
    context: Context
}>();
</script>

<template>
    <div class="container">
        <el-scrollbar>
            <PlatformSelected :context="context"></PlatformSelected>
            <LableLayerInfo :context="context"></LableLayerInfo>
            <LableFill :context="context"></LableFill>
            <LableBorder :context="context"></LableBorder>
        </el-scrollbar>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 100%;
    font-size: var(--font-default-fontsize);
}
</style>