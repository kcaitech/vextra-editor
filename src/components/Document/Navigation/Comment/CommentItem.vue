<script setup lang="ts">
import {ref, onMounted, watchEffect} from "vue"
import { ChatDotSquare, Delete, CircleCheck } from '@element-plus/icons-vue'
const hover = ref(false)
const hoverShape = (e: MouseEvent) => {
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    hover.value = false
}
onMounted(() => {
    
})
</script>
<template>
    <div class="comment-item-container" :class="{active: hover}" @mouseenter="hoverShape" @mouseleave="unHoverShape">
        <div class="avatar"><img src="https://thirdwx.qlogo.cn/mmopen/vi_32/getbgSw8iaiagB4ChgXIiax3eYG9U8iaWVkTZemvaTZRXZz6oad8tl7qXWxLxgfFQxWUZVPj1oXI5lGQpicNOnZPoMg/132" alt=""></div>
        <div class="content">
            <div class="item-title">
                <div class="name">
                    <div>丘吉尔 </div>&nbsp;&nbsp;
                    <div class="date"> 5月20日 13:14</div>
                </div>
                <div class="icon" :style="{visibility: hover ? 'visible' : 'hidden'}">
                    <el-icon :size="13" style="margin-right: 4px;"><ChatDotSquare /></el-icon>
                    <el-icon :size="13" style="margin-right: 4px;"><Delete /></el-icon>
                    <el-icon :size="13"><CircleCheck /></el-icon>
                </div>
            </div>
            <div class="text">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Illum aliquid accusantium veniam cumque, natus voluptate qui voluptatem eaque dicta consectetur fugit maiores iste, nobis explicabo laudantium soluta dolore neque unde!
            </div>
            <div class="bottom-info">
                <div class="reply">0 条回复</div>
                <div class="page">页面1</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
    .comment-item-container {
        font-size: var(--font-default-fontsize);
        padding: var(--default-padding-half) 0;
        padding-left: var(--default-padding-half);
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
            >img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
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
                justify-content: space-between;
                .name {
                    display: flex;
                }
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
                color:rgba(0, 0, 0, .5);
            }
            .bottom-info {
                display: flex;
                margin-top: 10px;
                justify-content: space-between;
                .page {
                    color:rgba(0, 0, 0, .5);
                }
            }
        }
    }
    .active {
        background-color: var(--grey);
    }
</style>