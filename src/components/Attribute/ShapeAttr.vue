<script setup lang="ts">
import { defineProps } from 'vue'
import { Shape } from '@/data/shape';
import IconText from '../common/IconText.vue';
const props = defineProps<{ shape: Shape }>();

</script>

<template>
    <div class="table">
        <div class="tr">
            <IconText class="td" ticon="X" :text="props.shape.frame.x.toFixed(2)" />
            <IconText class="td" ticon="Y" :text="props.shape.frame.y.toFixed(2)" />
        </div>
        <div class="tr">
            <IconText class="td" ticon="W" :text="props.shape.frame.width.toFixed(2)" />
            <IconText class="td" ticon="H" :text="props.shape.frame.height.toFixed(2)" />
        </div>
    </div>
</template>

<style scoped>
.table {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 2px;
    padding-right: 1px;
    box-sizing: border-box;
}

.tr {
    width: 100%;
    height: 30px;
    align-items: center;
    display: flex;
    flex-direction: row;
}

.td {
    width: 50%;
}
</style>