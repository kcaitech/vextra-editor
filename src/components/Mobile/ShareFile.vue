<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watchEffect, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import * as share_api from '@/request/share';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { DocInfo } from "@/context/user"
import { useAttrs } from 'vue'
import { router } from '@/router';
import Loading from '../common/Loading.vue';

const attrs = useAttrs()

console.log(attrs.abc);

enum permissions {
    noAuthority,
    readOnly,
    reviewable,
    editable
}

enum docType {
    Private,
    Share,
    Read,
    Critical,
    Edit
}

const props = defineProps<{
    docId: string,
    projectPerm?: number | undefined
}>()

const emit = defineEmits<{
    (e: 'close'): void,
}>()

const { t } = useI18n()
const docInfo = ref<DocInfo>()
const route = useRoute()
const docID = props.docId ? props.docId : route.query.id
const UserId = localStorage.getItem('userId') //当前用户ID
const value1 = ref<boolean>()
const authority = ref(false)
const isSelectOpen = ref<boolean>(false)
const index = ref(0)
const editable = ref(`${t('share.editable')}`)
const reviewable = ref(`${t('share.reviewable')}`)
const readOnly = ref(`${t('share.readOnly')}`)
const remove = ref(`${t('share.remove')}`)
const founder = ref(false)
const shareList = ref<any[]>([])
const selectValue = ref<number>(-1)
const userlist = ref<boolean>(false)
const loading = ref<boolean>(false)
const errormessage = ref<string>()
const projectfile = ref<boolean>(false)

const DocType = reactive([
    `${t('share.shareable')}`,
    `${t('share.need_to_apply_for_confirmation')}`,
    `${t('share.anyone_can_read_it')}`,
    `${t('share.anyone_can_comment')}`,
    `${t('share.anyone_can_edit_it')}`
])
const permission = reactive([
    `${t('share.no_authority')}`,
    `${t('share.readOnly')}`,
    `${t('share.reviewable')}`,
    `${t('share.editable')}`
])



const options = [
    {
        value: 1,
        label: `${t('share.need_to_apply_for_confirmation')}`
    },
    {
        value: 2,
        label: `${t('share.anyone_can_read_it')}`
    },
    {
        value: 3,
        label: `${t('share.anyone_can_comment')}`
    },
    {
        value: 4,
        label: `${t('share.anyone_can_edit_it')}`
    }
]

const documentShareURL = computed(() => {
    return route.path !== '/pageviews'
        ?
        location.origin + `/pageviews?id=${docID}` + ' ' + `邀请您进入《${(docInfo.value as DocInfo).document.name}》，点击链接开始协作`
        :
        location.href + ' ' + `邀请您进入《${(docInfo.value as DocInfo).document.name}》，点击链接开始协作`
})

const listuser = computed(() => {
    return shareList.value.length
})

//获取文档信息
const getDocumentInfo = async () => {
    loading.value = true
    try {
        const { code, data, message } = await share_api.getDocumentInfoAPI({ doc_id: docID })
        loading.value = false
        if (code === 0) {
            docInfo.value = data as DocInfo
            value1.value = docInfo.value.document.doc_type === 0 ? false : true
            selectValue.value = docInfo.value.document.doc_type
        } else {
            errormessage.value = message
        }
    } catch (err) {
        console.log(err);
    }

}


const close = () => {
    if (userlist.value) {
        userlist.value = false
        return
    } else {
        emit('close')
    }
}

//是否显示权限编辑菜单
const selectAuthority = (i: number, e: Event) => {
    e.stopPropagation()
    if (isSelectOpen.value) isSelectOpen.value = false
    authority.value = !authority.value
    index.value = i
}

//设置为可编辑权限
const onEditable = (id: any, type: number, index: number) => {
    putShareAuthority(id, type)
    shareList.value[index].document_permission.perm_type = type
}

//设置为可评论权限
const onReviewable = (id: any, type: number, index: number) => {
    putShareAuthority(id, type)
    shareList.value[index].document_permission.perm_type = type
}

//设置为只读权限
const onReadOnly = (id: string, type: number, index: number) => {
    putShareAuthority(id, type)
    shareList.value[index].document_permission.perm_type = type
}

//移除分享列表（本地列表）
const onRemove = (id: string, i: number) => {
    delShare(id)
    shareList.value.splice(i, 1)
}

//获取当前文件分享列表
const getShareList = async () => {
    loading.value = true
    try {
        const { code, data, message } = await share_api.getShareListAPI({ doc_id: docID })
        loading.value = false
        if (code === 0) {
            shareList.value = data
        } else {
            console.log(message);
        }
    } catch (err) {
        console.log(err);
    }
}

//移除分享列表（服务端）
const delShare = async (id: string) => {
    try {
        await share_api.delShareAuthorityAPI({ share_id: id })
        getShareList()
    } catch (err) {
        console.log(err);
    }
}

//设置分享权限
const putShareAuthority = async (id: string, type: number) => {
    try {
        await share_api.putShareAuthorityAPI({ share_id: id, perm_type: type })
        getShareList()
    } catch (err) {
        console.log(err);
    }
}

//设置分享类型
const setShateType = async (type: number) => {
    try {
        await share_api.setShateTypeAPI({ doc_id: docID, doc_type: type })
        for (let i = 0; i < shareList.value.length; i++) {
            if (type === 1) {
                return
            } else if (shareList.value[i].document_permission.perm_source_type === 0) {
                shareList.value[i].document_permission.perm_type = type - 1
            }
        }
    } catch (err) {
        console.log(err);
    }
}

watchEffect(() => {
    //文档所有者的ID
    const docUserId = docInfo.value?.user.id
    if (props.projectPerm) {
        if (props.projectPerm > 3) {
            return founder.value = false;
        } else {
            if (props.projectPerm === 3 && UserId === docUserId) {
                return founder.value = false;
            } else {
                return founder.value = true;
            }
        }
    } else {
        UserId !== docUserId ? founder.value = true : founder.value = false
    }
})

//复制分享链接
const copyLink = async () => {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(documentShareURL.value).then(() => {
            ElMessage({
                message: `${t('share.copy_success')}`,
                type: 'success',
            })
        }, () => {
            ElMessage({
                message: `${t('share.copy_failure')}`,
                type: 'success',
            })
        })
    } else {
        const textArea = document.createElement('textarea')
        textArea.value = documentShareURL.value
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        ElMessage({
            message: `${t('share.copy_success')}`,
            type: 'success',
        })
        textArea.remove()
    }

}

watchEffect(() => {
    getDocumentInfo()
    if (!founder.value) getShareList()
})

watchEffect(() => {
    switch (selectValue.value) {
        case docType.Private:
            setShateType(docType.Private)
            break;
        case docType.Share:
            setShateType(docType.Share)
            break;
        case docType.Read:
            setShateType(docType.Read)
            break;
        case docType.Critical:
            setShateType(docType.Critical)
            break;
        case docType.Edit:
            setShateType(docType.Edit)
            break;
        default: null
            break;
    }
})

</script>

<template>
    <div class="share">
        <div class="header">
            <svg-icon icon-class="back-icon" @click.stop="userlist ? userlist = false : router.go(-1)"></svg-icon>
            <span>分享</span>
        </div>
        <div v-if="docInfo" class="content">
            <div style="color: #8C8C8C;margin: 16px 16px 8px 16px;">权限设置{{ docInfo.project ? '（文件所在项目所有成员固定可见）' : '' }}
            </div>
            <!-- 普通视图 -->
            <div v-if="founder" class="normal-view">
                <div class="file-name">
                    <span class="type">{{ t('share.file_name') }}</span>
                    <p class="name">{{ docInfo.document.name }}</p>
                </div>
                <div class="founder">
                    <span class="type">{{ t('share.founder') }}</span>
                    <p class="name">{{ docInfo.user.nickname }}</p>
                </div>
                <div class="permission">
                    <div class="type">{{ t('share.document_permission') }}</div>
                    <p class="name">{{ DocType[docInfo.document.doc_type] }}</p>
                </div>
            </div>
            <!-- 创建者视图 -->
            <div v-if="!founder" class="creator-view">
                <!-- <div class="everyone" @click.stop="selectValue = 2">
                    <div class="select" :style="{ visibility: [2, 3, 4].includes(selectValue) ? 'visible' : 'hidden' }">
                    </div> -->
                <div class="private" @click="selectValue = 0">
                    <span>仅自己</span>
                    <div class="select" :style="{ visibility: selectValue === 0 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="application" @click="selectValue = 1">
                    <span>需要确认</span>
                    <div class="select" :style="{ visibility: selectValue === 1 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="readOnly" @click="selectValue = 2">
                    <span>{{ t('share.anyone_can_read_it') }}</span>
                    <div class="select" :style="{ visibility: selectValue === 2 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="reviewable" @click="selectValue = 3">
                    <span>{{ t('share.anyone_can_comment') }}</span>
                    <div class="select" :style="{ visibility: selectValue === 3 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="editable" @click="selectValue = 4">
                    <span>{{ t('share.anyone_can_edit_it') }}</span>
                    <div class="select" :style="{ visibility: selectValue === 4 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <!-- <div class="bnt">所有人</div>
                    <div class="radio">
                        <div class="item" @click.stop>
                            <input type="radio" id="read" :value=2 v-model="selectValue" />
                            <label for="read">{{ t('share.readOnly') }}</label>
                        </div>

                        <div class="item" @click.stop>
                            <input type="radio" id="review" :value=3 v-model="selectValue" />
                            <label for="review">{{ t('share.reviewable') }}</label>
                        </div>

                        <div class="item" @click.stop>
                            <input type="radio" id="edit" :value=4 v-model="selectValue" />
                            <label for="edit">{{ t('share.editable') }}</label>
                        </div>
                    </div> -->
                <!-- </div> -->


            </div>
            <!-- 已加入分享的人 -->
            <div v-if="!founder" class="share-user" @click="userlist = true">
                <span>已加入分享的人</span>
                <div class="left-info">
                    <!-- <span style="color: #c8c8c8;">{{ listuser }}人</span> -->
                    <svg-icon icon-class="arrows-icon"></svg-icon>
                </div>

            </div>
            <!-- 分享到 -->
            <Transition enter-active-class="animate__animated animate__fadeInUp"
                leave-active-class="animate__animated animate__fadeOutDown">
                <div v-if="selectValue !== 0" class="share-to">
                    <div class="title">分享到</div>
                    <div class="type">
                        <div class="link" @click.stop="copyLink">
                            <div class="left">
                                <svg-icon icon-class="wechat-icon"></svg-icon>
                                <span>微信</span>
                            </div>
                            <div class="right">
                                <svg-icon icon-class="arrows-icon"></svg-icon>
                            </div>
                        </div>
                        <div class="link" @click.stop="copyLink">
                            <div class="left">
                                <svg-icon icon-class="link-icon"></svg-icon>
                                <span>复制链接</span>
                            </div>
                            <div class="right">
                                <svg-icon icon-class="arrows-icon"></svg-icon>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
            <!-- 分享的人员列表 -->
            <Transition name="fade">
                <div v-if="userlist" class="share-user-list">
                    <div v-for="(item, ids) in shareList" :key="ids" class="scrollbar-demo-item">
                        <div class="item-left">
                            <div class="avatar"><img :src="item.user.avatar"></div>
                            <div class="name">{{ item.user.nickname }}</div>
                        </div>
                        <div class="item-right">
                            <div class="authority">{{ permission[item.document_permission.perm_type] }}</div>
                        </div>
                    </div>
                    <div v-if="!shareList.length" class="null">
                        <span>没有加入的成员</span>
                    </div>
                    <div v-if="loading" class="loading">
                        <Loading :size="20"></Loading>
                    </div>
                </div>
            </Transition>
        </div>
        <div v-if="errormessage" class="failed">
            <span class="message"> {{ errormessage }}</span>
        </div>
    </div>
    <div v-if="loading" class="loading">
        <Loading :size="20"></Loading>
    </div>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateX(500px);
    opacity: 0.5;
}

.share-user-list {
    display: flex;
    flex-direction: column;
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    background-color: #fff;

    .scrollbar-demo-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 44px;
        gap: 8px;
        padding: 0 14px;
        margin-top: 8px;

        .item-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            overflow: hidden;
            white-space: nowrap;

            .avatar {
                height: 32px;
                width: 32px;
                min-width: 32px;
                border-radius: 50%;
                overflow: hidden;

                img {
                    height: 100%;
                    width: 100%;
                }
            }

            .name {
                overflow: hidden;
                text-overflow: ellipsis;
                font-weight: 500;
                color: rgba(0, 0, 0, 1);
            }
        }

        .item-right {
            position: relative;
            height: 44px;
            display: flex;
            align-items: center;
            gap: 2px;

            .founder,
            .authority {
                font-weight: 400;
                color: #c8c8c8;
            }
        }
    }

    .null {
        margin: auto;
        color: #8c8c8c;
    }
}

.share-user {
    display: flex;
    height: 64px;
    align-items: center;
    justify-content: space-between;
    margin: 16px 14px;
    background-color: #fff;
    border: 1px solid #F1F2F2;
    box-shadow: inset 0px -1px 0px 0px #F0F0F0;
    border-radius: 6px;
    padding: 0 16px;

    span {
        // margin-left: 14px;
    }

    .left-info {
        width: 10px;
        height: 10px;
        display: flex;
        align-items: center;
        margin-right: 8px;

        span {
            color: #c8c8c8;
        }

        svg {
            width: 100%;
            height: 100%;
        }
    }

}

.share-to {
    display: flex;
    flex-direction: column;
    margin: 16px 14px 0 14px;
    gap: 8px;

    .title {
        color: #8c8c8c;
    }

    .type {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 6px;
        border: 1px solid #F1F2F2;
        box-shadow: inset 0px -1px 0px 0px #F0F0F0;

        .link {
            display: flex;
            align-items: center;
            height: 64px;
            justify-content: space-between;
            margin: 0 14px;

            .left {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;

                svg {
                    width: 20px;
                    height: 20px;
                }

                span {
                    font-weight: 400;
                }
            }

            .right {
                width: 10px;
                height: 10px;
                margin-right: 8px;

                svg {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}

.share,
.loading {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #FAFAFA;
    z-index: 999;
    font-size: 15px;

    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 44px;

        svg {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 14px;
        }
    }

    .content {
        position: relative;
        height: calc(100% - 44px);

        .creator-view {
            display: flex;
            flex-direction: column;
            margin: 4px 14px;
            background-color: #fff;
            border-radius: 6px;
            border: 1px solid #F1F2F2;
            box-shadow: inset 0px -1px 0px 0px #F0F0F0;
            box-sizing: border-box;

            .application,
            .private,
            .readOnly,
            .reviewable,
            .editable {
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 64px;
                margin: 0 16px;
                border-bottom: 1px solid #f5f5f5;
                box-sizing: border-box;

                .bnt {
                    flex: 1;
                    display: flex;
                    align-items: center;
                }

                .radio {
                    display: flex;
                    gap: 12px;

                    .item {
                        display: flex;
                        align-items: center;
                        color: #8c8c8c;
                    }
                }

                .select {
                    height: 20px;
                    width: 20px;
                    margin-right: 8px;

                    svg {
                        width: 100%;
                        height: 100%;
                    }
                }

            }
        }

        .normal-view {
            display: flex;
            flex-direction: column;
            margin: 0 14px;
            background-color: #fff;
            border-radius: 6px;
            border: 1px solid #F1F2F2;
            box-shadow: inset 0px -1px 0px 0px #F0F0F0;
            box-sizing: border-box;

            .file-name,
            .founder,
            .permission {
                display: flex;
                align-items: center;
                margin: 0 14px;

                .type {
                    width: 96px;
                    min-width: 96px;
                    color: #8c8c8c;
                }

                .name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }


    }

    .failed {
        display: flex;
        flex-direction: column;
        height: calc(100% - 44px);

        .message {
            margin: auto;
            color: #8c8c8c;
        }
    }


}
</style>