<script setup lang="ts">
import {} from 'vue';
import { Context } from '@/context';
import { Shape } from '@kcdesign/data';
const props = defineProps<{
    context?: Context,
    shape?: Shape,
    title: string
}>();

</script>

<template>
    <div class="header-container">
        <div class="header">
            <div class="title">{{ props.title }}</div>
            <div class="space"></div>
            <div class="tool">
                <slot name="tool"></slot>
            </div>
        </div>
        <div class="line" />
    </div>
    
</template>

<style scoped lang="scss">
.header-container {
    width: 100%;
    min-height: 32px;
    box-sizing: border-box;
    position: relative;
    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1 auto 1;
        > .title {
            font-weight: 600;
            flex-shrink: 0;
        }
        > .space {
            width: 228px;
        }
    }
    > .header + .line {
        margin-top: 4px;
        margin-left: -10px;
        width: 250px;
        height: 1px;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
}
</style>