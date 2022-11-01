<script setup lang="ts">
import { defineProps } from 'vue'
import { Shape } from '@/data/shape';
import IconText from '../common/IconText.vue';
const props = defineProps<{ shape: Shape }>();
const logo = require("@/assets/logo.png")
// const frame = props.shape.frame;
</script>

<template>
    <div class="table">
        <div class="tr">
            <IconText class="td" ticon="X" :text="props.shape.frame.x" />
            <IconText class="td" ticon="Y" :text="props.shape.frame.y" />
        </div>
        <div class="tr">
            <IconText class="td" ticon="W" :text="props.shape.frame.width" />
            <IconText class="td" ticon="H" :text="props.shape.frame.height" />
        </div>
    </div>
</template>

<style scoped>
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 2px;
    box-sizing: border-box;
}

.tr {
    width: 100%;
    display: flex;
    flex-direction: row;
}

.td {
    width: 50%;
}
</style>