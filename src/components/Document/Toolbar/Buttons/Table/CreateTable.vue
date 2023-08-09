<script setup lang="ts"></script>

<template>
    <div class="table_container">
        <div class="table-title">
            <span>插入表格</span>
            <span>3行5列</span>
        </div>
        <div class="table-cell"></div>
        <div class="table-state"></div>
        <div class="table-input"></div>
        <div class="table-button"></div>
    </div>
</template>

<style lang="scss" scoped>
.table_container {
    position: absolute;
    z-index: 999;
    width: 300px;
    height: 400px;
    border-radius: 4px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    font-size: var(--font-default-fontsize);
}
</style>