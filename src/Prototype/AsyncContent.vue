<script lang="ts" setup>
import { Shape } from "@kcdesign/data";

const props = defineProps<{
    shapes: Shape[];

    toImage?: boolean;
}>()
const emits = defineEmits<{
    (e: 'loaded'): void;
}>();

function update() {
}

function reset() {
}

defineExpose({ update, reset });

function init() {

}
</script>
<template>

</template>
<style scoped lang="scss">

</style>