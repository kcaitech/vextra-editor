<script setup lang="ts">
import {ref, onMounted, computed } from "vue"
import { ChatDotSquare, Delete, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'
import { Context } from "@/context";
import { useI18n } from 'vue-i18n'
import { Page } from '@kcdesign/data';
import * as comment_api from '@/apis/comment';
const { t } = useI18n()
const props = defineProps<{
    commentItem: any,
    index: number,
    context: Context,
    pageId: string
}>()
const emit = defineEmits<{
    (e: 'resolve', status: number, index: number): void
    (e: 'delete', index: number):void
}>()
const hover = ref(false)
const status = computed(() => {
    const status = props.commentItem.status
    const reply = props.commentItem.commentMenu[2].status_p
    if(reply) {
        return true
    }else {
        return status === 0
    }
})
const replyNum = computed(() => {
    const child = props.commentItem.childern.length
    return child
})
const resolve = ref(props.commentItem.status === 0)

const hoverShape = (e: MouseEvent) => {
    hover.value = true
}
const page = ref<Page>()
const unHoverShape = (e: MouseEvent) => {
    hover.value = false
}

const onReply = (e: Event) => {
    e.stopPropagation()
    console.log('回复评论');
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    const status = props.commentItem.status === 0 ? 1 : 0
    setCommentStatus(status)
    emit('resolve', status, props.index)
    resolve.value = !resolve.value
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    deleteComment()
    emit('delete', props.index)
}

const setCommentStatus = async(status: number) => {
    try{
        await comment_api.setCommentStatusAPI({id: props.commentItem.id, status: status})
    }catch(err) {
        console.log(err);
    }
}

const deleteComment = async() => {
    try{
        await comment_api.deleteCommentAPI({comment_id: props.commentItem.id})
    }catch(err) {
        console.log(err);
    }
}

const formatDate = computed(() => {
  return function (value: string): string {
    const date = new Date(value);
    const zh_month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const lang = localStorage.getItem('locale') || 'zh'
    const en_month = date.toLocaleString('en-US', { month: 'long' });
    if(lang === 'zh') {
        return `${zh_month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }else {
        return `${en_month} ${day}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
})
const getPage = () => {
    const p = props.context.data
    p.pagesMgr.get('c62c70d6-8347-4b22-bebb-7e5fff9c0276').then((p: Page | undefined) => {
        if(!p) return
            page.value = p
    })
}
getPage()
onMounted(() => {
})
</script>
<template>
    <div class="comment-item-container" :class="{active: hover}" @mouseenter="hoverShape" @mouseleave="unHoverShape" v-if="status">
        <div class="avatar">
            <img :src="props.commentItem.user.avatar" alt="">
        </div>
        <div class="content">
            <div class="item-title">
                <div class="name">
                    <div :style="{opacity: props.commentItem.status === 0 ? 1 : 0.5}">{{props.commentItem.user.nickname}} </div>&nbsp;&nbsp;
                    <div class="date">{{ formatDate(props.commentItem.record_created_at) }}</div>
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
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-if="resolve">
                            <el-button plain :icon="CircleCheck" @click="onResolve"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`"
                            placement="bottom" :show-after="1000" :offset="10" :hide-after="0" v-else>
                            <el-button class="custom-icon" plain :icon="CircleCheckFilled" @click="onResolve"/>
                        </el-tooltip>
                    </el-button-group>
                </div>
            </div>
            <div class="text">{{ props.commentItem.content }}</div>
            <div class="bottom-info">
                <div class="reply" :style="{opacity: props.commentItem.status === 0 ? 1 : 0.5}">{{replyNum}} {{ t('comment.a_few_reply') }}</div>
                <div class="page">{{ page?.name }}</div>
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
    .custom-icon {
        color: green; /* 设置颜色为绿色 */
    }
</style>