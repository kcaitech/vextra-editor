<script setup lang="ts">
import { ref } from 'vue';



const scale = ref(0);
const transX = ref(0);
const transY = ref(0);

function onMouseWheel(e: MouseEvent) {
    // console.log(e);
    // e.preventDefault();
    // e.stopPropagation();
    // return true;
}

</script>

<template>
<div @wheel.passive="onMouseWheel">
    <slot>

    </slot>
</div>
</template>

<style scoped>

</style>