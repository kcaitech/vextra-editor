<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Context } from '@/context';
import { ChatDotSquare, Delete, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import * as comment_api from '@/apis/comment';
import { WorkSpace } from '@/context/workspace';
const { t } = useI18n()
const props = defineProps<{
    context: Context
    scale: number
    commentInfo: any
    index: number
}>()
const emit = defineEmits<{
    (e: 'unHoverComment'): void
    (e: 'showComment', event: MouseEvent): void
    (e: 'deleteComment', index: number): void
    (e: 'resolve', status: number, index: number): void
    (e: 'moveCommentPopup', event: MouseEvent, index: number): void
}>()
const workspace = computed(() => props.context.workspace);
const hover = ref(false)
const replyNum = computed(() => {
    if (props.commentInfo.children) {
        const child = props.commentInfo.children.length
        return child
    } else {
        return 0
    }
})
const resolve = computed(() => {
    return props.commentInfo.status === 0 ? true : false
})
const isControls = computed(() => {
    props.commentInfo.user.id || workspace.value.isDocumentInfo?.user.id || workspace.value.isUserInfo?.id
    if(workspace.value.isUserInfo?.id === props.commentInfo.user.id || workspace.value.isUserInfo?.id === workspace.value.isDocumentInfo?.user.id) return true
    else return false
})

const hoverShape = (e: MouseEvent) => {
    workspace.value.hoverComment(true, props.commentInfo.id)
    hover.value = true
}
const unHoverShape = (e: MouseEvent) => {
    workspace.value.hoverComment(false, props.commentInfo.id)
    hover.value = false
    emit('unHoverComment')
}

const onReply = (e: MouseEvent) => {
    e.stopPropagation()
    hover.value = false
    emit('showComment', e)
}

const onResolve = (e: Event) => {
    e.stopPropagation()
    if(!isControls.value) return
    const status = props.commentInfo.status === 0 ? 1 : 0
    setCommentStatus(status)
    emit('resolve', status, props.index)
}

const onDelete = (e: Event) => {
    e.stopPropagation()
    if(!isControls.value) return
    emit('deleteComment', props.index)
    props.context.workspace.commentInput(false);
    deleteComment()
}

const onClick = (e: MouseEvent) => {
    emit('showComment', e)
}

const deleteComment = async () => {
    try {
        await comment_api.deleteCommentAPI({ comment_id: props.commentInfo.id })
    } catch (err) {
        console.log(err);
    }
}

const setCommentStatus = async (status: number) => {
    try {
        await comment_api.setCommentStatusAPI({ id: props.commentInfo.id, status: status })
    } catch (err) {
        console.log(err);
    }
}

const moveCommentPopup = (e: MouseEvent) => {
    e.stopPropagation()
    emit('moveCommentPopup', e, props.index)
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
        if (lang === 'zh') {
            return `${zh_month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
            return `${en_month} ${day}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }
})

onMounted(() => {
    // props.context.workspace.watch(workspaceUpdate);
})
onUnmounted(() => {
    props.context.workspace.commentOpacity(false)
    props.context.workspace.commentInput(false);
    // props.context.workspace.unwatch(workspaceUpdate);
})
</script>

<template>
    <div class="container-hover" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown="moveCommentPopup"
        @mouseup="onClick" :style="{ transform: `scale(${props.scale})` }">
        <div class="avatar">
            <img :src="commentInfo.user.avatar" alt="">
        </div>
        <div class="content">
            <div class="box-heard">
                <div class="item_heard">
                    <div class="name">{{ commentInfo.user.nickname }}</div>&nbsp;&nbsp;
                    <div class="date">{{ formatDate(commentInfo.record_created_at) }}</div>
                </div>
                <div class="icon" :style="{ visibility: hover ? 'visible' : 'hidden' }">
                    <el-button-group class="ml-4">
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.reply')}`" placement="bottom"
                            :show-after="1000" :offset="10" :hide-after="0">
                            <el-button plain :icon="ChatDotSquare" @click="onReply" style="margin-right: 5px;" />
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.delete')}`" placement="bottom"
                            :show-after="1000" :offset="10" :hide-after="0">
                            <el-button plain :icon="Delete" @click="onDelete" :style="{'margin-right': 5 +'px', opacity: isControls ? 1 : .3}"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                            :show-after="1000" :offset="10" :hide-after="0" v-if="resolve">
                            <el-button plain :icon="CircleCheck" @click="onResolve" @mouseup.stop @mousedown.stop :style="{opacity: isControls ? 1 : .3}"/>
                        </el-tooltip>
                        <el-tooltip class="box-item" effect="dark" :content="`${t('comment.settled')}`" placement="bottom"
                            :show-after="1000" :offset="10" :hide-after="0" v-else>
                            <el-button class="custom-icon" plain :icon="CircleCheckFilled" @click="onResolve"  @mouseup.stop @mousedown.stop :style="{opacity: isControls ? 1 : .3}"/>
                        </el-tooltip>
                    </el-button-group>
                </div>
            </div>
            <div class="box-context">{{ commentInfo.content }}</div>
            <div class="box-footer">
                <div class="reply">{{ replyNum }} {{ t('comment.a_few_reply') }}</div>
                <div class="check">{{ t('comment.check') }}</div>
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
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
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

            .item_heard {
                    display: flex;
                    width: calc(100% - 80px);
                    .name {
                        max-width: calc(100% - 82px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .date {
                        width: 82px;
                    }
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
                        background-color: rgba(0, 0, 0, 0.08);
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
                color: rgba(0, 0, 0, .5);
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

.custom-icon {
    color: green;
    /* 设置颜色为绿色 */
}</style>