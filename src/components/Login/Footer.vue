<script setup lang="ts">



</script>

<template>
    <div class="footer">
        <span>
            © 2023 Kc.Design Inc. All rights reserved.
        </span>
        <span><a href="http://www.baidu.com">使用协议</a></span>
        <span><a href="http://www.baidu.com">隐私政策</a></span>
     
    </div>
</template>

<style lang="scss" scoped>
.footer {
    display: flex;
    position: fixed;
    z-index: 1;
    bottom: 0;
    color: rgb(164, 162, 162);

    >span {
        margin: 5px;

        >a {
            font-size: 14px;
        }
    }


}
</style>