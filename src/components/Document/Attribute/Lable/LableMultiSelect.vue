<script setup lang="ts">
import LableType from './LableType.vue'
</script>

<template>
    <div class="container">
        <LableType title="已选择多个图层">
            <template #select>
                <div class="palce"></div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.palce {
    height: 30px;
}
</style>