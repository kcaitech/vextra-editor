<script setup lang="ts">
import { ref } from 'vue'
import { Context } from '@/context';
import { ChatDotSquare, Delete, CircleCheck } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps<{
    context: Context
    scale: number
}>()
const emit = defineEmits<{
    (e: 'unHoverComment'): void
    (e: 'showComment', event: MouseEvent): void
}>()
const hover = ref(false)
const hoverShape = (e: MouseEvent) => {
    hover.value = true
}
const unHoverShape = (e: MouseEvent) => {
    hover.value = false
    emit('unHoverComment')
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

const onClick = (e: MouseEvent) => {
    e.stopPropagation()
    emit('showComment', e)
}
</script>

<template>
    <div class="container-hover" @mouseenter="hoverShape" @mouseleave="unHoverShape" @click="onClick" :style="{transform: `scale(${props.scale})`}" @mouseup.stop>
        <div class="avatar">
            <img src="https://thirdwx.qlogo.cn/mmopen/vi_32/getbgSw8iaiagB4ChgXIiax3eYG9U8iaWVkTZemvaTZRXZz6oad8tl7qXWxLxgfFQxWUZVPj1oXI5lGQpicNOnZPoMg/132" alt="">
        </div>
        <div class="content">
            <div class="box-heard">
                <div class="name">
                    <div>丘吉尔 </div>&nbsp;&nbsp;
                    <div class="date"> 5月20日 13:14</div>
                </div>
                <div class="icon" :style="{visibility: hover ? 'visible' : 'hidden'}">
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
            <div class="box-context">Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis,  Lorem ipsum dolor, sit amet consectetur a</div>
            <div class="box-footer">
                <div class="reply">0 条回复</div>
                <div class="check">查看</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
   .container-hover {
    position: absolute;
    left: 0;
    bottom: 0;
    box-sizing: border-box;
    display: flex;
    width: 330px;
    padding: 12px;
    background-color: #fff;
    box-shadow: 0px 5px 10px rgba(0,0,0,0.15);
    border-radius: calc(6px);
    border-bottom-left-radius: 0;
    font-size: var(--font-default-fontsize);
    transition: 0.2s;
    transform-origin: left bottom;
    cursor: default;
    .avatar {
            width: 30px;
            height: 30px;
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
            width: 270px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .box-heard {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                .name {
                    display: flex;
                }
                .icon {
                    width: 70px;
                    height: 20px;
                    .el-button {
                        border: none;
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
            .box-context {
                width: 270px;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                overflow: hidden;
            }
            .box-footer {
                display: flex;                
                margin-top: 10px;
                justify-content: space-between;
                align-items: center;
                .reply {
                    color:rgba(0, 0, 0, .5);
                }
                .check {
                    width: 55px;
                    height: 25px;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: 1px solid rgba(0, 0, 0, .5);
                    border-radius: 4px;
                }
            }
        }
   }
</style>