<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, watchEffect, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import * as share_api from '@/request/share';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { DocInfo } from "@/context/user"

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
    return route.path !== '/document'
        ?
        location.origin + `/#/document?id=${docID}` + ' ' + `邀请您进入《${(docInfo.value as DocInfo).document.name}》，点击链接开始协作`
        :
        location.href + ' ' + `邀请您进入《${(docInfo.value as DocInfo).document.name}》，点击链接开始协作`
})

//获取文档信息
const getDocumentInfo = async () => {
    try {
        const { code, data, message } = await share_api.getDocumentInfoAPI({ doc_id: docID })
        if (code === 0) {
            docInfo.value = data as DocInfo
            value1.value = docInfo.value.document.doc_type === 0 ? false : true
            selectValue.value = docInfo.value.document.doc_type
        } else {
            emit('close')
            ElMessage.error(message === '审核不通过' ? t('system.sensitive_reminder2') : message)
        }
    } catch (err) {
        console.log(err);
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
    try {
        const { data } = await share_api.getShareListAPI({ doc_id: docID })
        if (data) {
            shareList.value = data
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
    <div class="share" v-if="docInfo">
        <div class="header">
            <svg-icon icon-class="back-icon" @click.stop="emit('close')"></svg-icon>
            <span>分享</span>
        </div>
        <div class="content">
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
                <div class="everyone" @click.stop="selectValue = 2">
                    <div class="select" :style="{ visibility: [2, 3, 4].includes(selectValue) ? 'visible' : 'hidden' }">
                    </div>
                    <div class="bnt">所有人</div>
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
                    </div>
                </div>
                <div class="application" @click="selectValue = 1">
                    <div class="select" :style="{ visibility: [1].includes(selectValue) ? 'visible' : 'hidden' }"></div>
                    <span>需要确认</span>
                </div>
                <div class="private" @click="selectValue = 0">
                    <div class="select" :style="{ visibility: [0].includes(selectValue) ? 'visible' : 'hidden' }"></div>
                    <span>仅自己</span>
                </div>
            </div>
            <!-- 已加入分享的人 -->
            <div v-if="!founder" class="share-user">
                <span>已加入分享的人</span>
                <svg-icon icon-class="back-icon"></svg-icon>
            </div>

            <!-- 分享到 -->
            <div class="share-to">
                <div class="title">分享到</div>
                <div class="type">
                    <div class="link" @click.stop="copyLink">
                        <div class="icon"></div>
                        <span>复制链接</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.share-user {
    display: flex;
    height: 44px;
    align-items: center;
    transform: rotate();
    justify-content: space-between;
    border-top: 1em solid #f5f7fb;

    span {
        margin-left: 14px;
    }

    svg {
        width: 24px;
        height: 24px;
        margin-top: 2px;
        transform: rotate(180deg);
        margin-right: 14px;
    }
}

.share-to {
    display: flex;
    flex-direction: column;
    border-top: 1em solid #f5f7fb;

    .title {
        color: #8c8c8c;
        margin: 14px 14px 0 14px;
    }

    .type {
        display: flex;

        .link {
            width: 80px;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.6em;
            margin-top: 0.6em;


            .icon {
                width: 40px;
                height: 40px;
                border-radius: 100%;
                background-color: blue;
            }

            span {
                font-size: 12px;
                font-weight: 400;
            }
        }
    }
}

.share {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 999;

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

        span {}
    }

    .content {
        .creator-view {
            display: flex;
            flex-direction: column;
            margin: 0 14px;

            .everyone,
            .application,
            .private {
                display: flex;
                align-items: center;
                height: 44px;

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
                    height: 6px;
                    width: 12px;
                    border-left: 2px solid #1878F5;
                    border-bottom: 2px solid #1878F5;
                    transform: rotate(-45deg);
                    margin: 0 12px;
                }

            }
        }

        .normal-view {
            display: flex;
            flex-direction: column;
            margin: 0 14px;

            .file-name,
            .founder,
            .permission {
                display: flex;
                align-items: center;

                .type {
                    width: 96px;
                    min-width: 96px;
                    color: #8c8c8c;
                }
            }
        }


    }
}
</style>