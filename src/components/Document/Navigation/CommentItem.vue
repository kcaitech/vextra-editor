<script setup lang="ts">
import {ref, onMounted, watchEffect} from "vue"

onMounted(() => {
    
})
</script>
<template>
    <div class="comment-item-container">
        <div class="avatar"></div>
        <div class="content">
            <div class="item-title">
                <div class="name">丘吉尔 </div>&nbsp;&nbsp;
                <div class="date"> 5月20日 13:14</div>
            </div>
            <div class="text">
                踩踩踩踩踩踩踩踩踩踩踩踩踩踩踩踩踩踩从呱呱呱呱呱呱呱呱呱呱呱呱呱呱呱古古怪怪反反复复烦烦烦烦烦烦烦烦烦烦烦烦烦烦烦反反复复烦烦烦烦烦烦烦烦烦烦烦烦烦烦烦
            </div>
            <div class="bottom-info">
                <div class="reply">0条回复</div>
                <div class="page">页面1</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .comment-item-container {
        font-size: var(--font-default-fontsize);
        padding: var(--default-padding-half) 0;
        display: flex;
        .avatar {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #efefef;
            margin-right: 5px;
        }
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-right: 5px;
            .item-title {
                display: flex;
                width: 100%;
                height: 30px;
                align-items: center;
            }
            .text {
                width: auto;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                overflow: hidden;
                /* 使用未来规范的line-clamp属性 */
                line-clamp: 4;
                /* 兼容不同浏览器的前缀 */
                -webkit-line-clamp: 4;
                -moz-line-clamp: 4;
                /* 显示省略号 */
                text-overflow: ellipsis;
            }
            .bottom-info {
                display: flex;
                margin-top: 10px;
                justify-content: space-between;
            }
        }
    }
</style>