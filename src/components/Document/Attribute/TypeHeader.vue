<script setup lang="ts">
const props = defineProps<{
    title: string,
    active: boolean
}>();
</script>

<template>
    <div class="header-container">
        <div class="header">
            <div class="title" :class="{ 'checked': active }">{{ props.title }}</div>
            <div class="tool">
                <slot name="tool"></slot>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.header-container {
    width: 100%;
    min-height: 28px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;

    .header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        >.title {
            flex: 0 0 auto;
            height: 14px;
            font-family: HarmonyOS Sans;
            font-size: 12px;
            font-weight: normal;
            font-feature-settings: "kern" on;
            color: #737373;
        }

        .checked {
            color: #000000;
        }

        .tool {
            display: flex;
            align-items: center;
            flex: 0 0 auto;
        }
    }

    >.header+.line {
        margin-top: 4px;
        margin-left: -10px;
        width: 250px;
        height: 1px;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
}
</style>