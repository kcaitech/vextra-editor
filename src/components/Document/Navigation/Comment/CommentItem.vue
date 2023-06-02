<script setup lang="ts">
import {ref, onMounted, watchEffect} from "vue"
import { ChatDotSquare, Delete, CircleCheck } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const hover = ref(false)
const hoverShape = (e: MouseEvent) => {
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    hover.value = false
}

const onReply = (e: Event) => {
    e.stopPropagation()
    console.log('回复评论');
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    console.log('解决评论');
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    console.log('删除评论');
}

onMounted(() => {
    
})
</script>
<template>
    <div class="comment-item-container" :class="{active: hover}" @mouseenter="hoverShape" @mouseleave="unHoverShape">
        <div class="avatar">
            <img src="https://thirdwx.qlogo.cn/mmopen/vi_32/getbgSw8iaiagB4ChgXIiax3eYG9U8iaWVkTZemvaTZRXZz6oad8tl7qXWxLxgfFQxWUZVPj1oXI5lGQpicNOnZPoMg/132" alt="">
        </div>
        <div class="content">
            <div class="item-title">
                <div class="name">
                    <div>丘吉尔 </div>&nbsp;&nbsp;
                    <div class="date"> 5月20日 13:14</div>
                </div>
                <div class="icon"  :style="{visibility: hover ? 'visible' : 'hidden'}">
                    <el-button-group class="ml-4">
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.reply')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                            <el-button plain :icon="ChatDotSquare" @click="onReply" style="margin-right: 5px;"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                            <el-button plain :icon="Delete" @click="onDelete" style="margin-right: 5px;"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0">
                            <el-button plain :icon="CircleCheck" @click="onResolve"/>
                        </el-tooltip>
                    </el-button-group>
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
                .icon {
                    width: 70px;
                    height: 20px;
                    .el-button {
                        border: none;
                        background-color: transparent;
                        padding: 0;
                        border-radius: 2px;
                        width: 20px;
                        height: 20px;
                        &:hover {
                            background-color: rgba(0,0,0,0.08);
                        }
                    }
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