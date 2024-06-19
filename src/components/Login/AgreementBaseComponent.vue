<template>
    <div class="container">
        <Header></Header>
        <slot></slot>
        <Footer></Footer>
    </div>
</template>

<script setup lang="ts">
import Footer from './Footer.vue'
import Header from './HeaderComponent.vue'
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    // overflow-x: hidden;
}

::-webkit-scrollbar {
    display: none;
    width: 0;
}
</style>
