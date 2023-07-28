<script setup lang="ts">
interface Props {
    context: Context
}
const props = defineProps<Props>();
function init() { }
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet" overflow="visible" :width="100"
        :height="100" viewBox="0 0 100 100" style="position: absolute">
        <g id="node">
            <path d="M -2 -2 L 2 2 z" stroke-width="1px" stroke="red"></path>
            <path d="M 2 -2 L -2 2 z" stroke-width="1px" stroke="red"></path>
        </g>
        <use transform="translate(500, 500)" xlink:href="#node"></use>
        <use transform="translate(200, 500)" xlink:href="#node"></use>
        <use transform="translate(400, 300)" xlink:href="#node"></use>
        <use transform="translate(400, 700)" xlink:href="#node"></use>
        <use transform="translate(400, 500)" xlink:href="#node"></use>
        <path d="M500 500 L200 500 z" stroke-width="1px" stroke="red"></path>
        <path d="M400 300 L400 700 z" stroke-width="1px" stroke="red"></path>
    </svg>
</template>
<style scoped lang="scss"></style>