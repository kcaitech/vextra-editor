<template>
    <span>共享给我的文件</span>
    <div>
        This text has special styles when you highlight it.
        <p  v-if="awesome">Also try selecting text in this paragraph.</p>
        <p v-else>asdasdasd</p>
        <button @click="awesome = !awesome">ceshi</button>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';


const awesome =ref(false)

</script>
<style lang="scss" scoped>

</style>
