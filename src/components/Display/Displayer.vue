<script setup lang="ts">

</script>
<template>
<div class="main">
    <h1>⚙🍐⚙</h1>
</div>
</template>
<style lang="scss">
html,
body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family);
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100vh;

    &::-webkit-scrollbar {
        height: 0;
        width: 0;
    }
}

#app {
    position: absolute;
    width: 100%;
    height: 100%;
}
.main {
    min-width: 460px;
    width: 100%;
    height: 100vh;
    overflow-x: auto;

    @media (max-width: 460px) {
        overflow-x: scroll;
    }

    &::-webkit-scrollbar {
        display: none;
    }

    &::-webkit-scrollbar-track {
        display: none;
    }

    &::-webkit-scrollbar-thumb {
        display: none;
    }

    &::-webkit-scrollbar-thumb:hover {
        display: none;
    }

    &::-webkit-scrollbar-thumb:active {
        display: none;
    }

    #content {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
    }
}
</style>