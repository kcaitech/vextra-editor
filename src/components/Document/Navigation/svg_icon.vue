<script setup lang="ts">
import { computed } from 'vue';
import { icons } from './list-icons'; // 导入 SVG 内容
import SvgIcon from '@/components/common/SvgIcon.vue';
const props = defineProps<{
    icon: string;
    iconContent: string;
    theme: string;
}>()

const svgContent  = computed(() => {
    return icons[props.icon];
})

</script>

<template>
    <div v-if="svgContent" v-html="svgContent " class="className" :style="{ fill: theme, stroke: theme }"></div>
    <SvgIcon v-else :icon="iconContent" :fill="theme" :stroke="theme"/>
</template>

<style scoped lang="scss">
.className {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
}
</style>