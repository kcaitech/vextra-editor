<script setup lang="ts">

</script>
<template>
    <div class="version-desc">
        <div class="window">
            <h2>更新信息</h2>
        </div>
    </div>
</template>
<style scoped lang="scss">
.version-desc {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    top: 0;
    z-index: 10000;

    .window {
        box-sizing: border-box;
        padding: 12px;
        width: 720px;
        height: 300px;
        background-color: #FFFFFF;
        border-radius: var(--default-radius);
        position: absolute;
        top: 32%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: 0.3s;
    }
}
</style>