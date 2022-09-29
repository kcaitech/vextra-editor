<script setup lang="ts">
import { ComponentInternalInstance, getCurrentInstance, ref } from 'vue';



const scale = ref(0);
const transX = ref(0);
const transY = ref(0);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

function onMouseWheel(e: MouseEvent) {
    // console.log(e);
    // e.preventDefault();
    // e.stopPropagation();
    // return true;

    // console.log("contentview",proxy)s
}

</script>

<template>
<div @wheel.passive="onMouseWheel">
    <slot>

    </slot>
</div>
</template>

<style scoped>
div {
    background-color: var(--center-content-bg-color);
}
</style>