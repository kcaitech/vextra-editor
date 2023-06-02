<script setup lang="ts">
</script>
<template>
    <div class="loader"></div>
</template>
<style scoped lang="scss">
.loader {
    border: 2px solid transparent;
    border-top: 2px solid #fff;
    border-left: 2px solid #fff;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>