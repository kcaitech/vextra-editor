<script setup lang="ts">
const WIDTH = 250;
const WIDTH_CSS = `${WIDTH}px`;
const HEIGHT = 200;
const HEIGHT_CSS = `${HEIGHT}px`;
</script>

<template>
    <div id="saturation" :style="{width: WIDTH_CSS, height: HEIGHT_CSS}">
        <div class="white"></div>
        <div class="black"></div>
    </div>
</template>

<style scoped lang="scss">
#saturation {
    position: relative;
    background-color: red;

    .white {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #fff, #fff0);
    }

    .black {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(0deg, #000, #fff0);
    }
}
</style>