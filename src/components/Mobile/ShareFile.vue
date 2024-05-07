<script setup lang="ts">
import { ref, reactive, watchEffect, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import * as share_api from '@/request/share';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { DocInfo } from "@/context/user"
import { useAttrs } from 'vue'
import { router } from '@/router';
import Loading from '../common/Loading.vue';
import { useCounterStore } from './team'
import { storeToRefs } from 'pinia'

const Data = useCounterStore()
const { projectlist } = storeToRefs(Data)
const { GetprojectLists } = Data

enum docType {
    Private,
    Share,
    Read,
    Critical,
    Edit
}

const emit = defineEmits<{
    (e: 'close'): void,
}>()

const { t } = useI18n()
const docInfo = ref<DocInfo>()
const route = useRoute()
const docID = ref<string>(route.query.id as string)
const UserId = localStorage.getItem('userId') //当前用户ID
const authority = ref(false)
const isSelectOpen = ref<boolean>(false)
const index = ref(0)
const founder = ref(false)
const selectValue = ref<number>(-1)
const selectDefault = ref<number>(-1)
const userlist = ref<boolean>(false)
const loading = ref<boolean>(false)
const errormessage = ref<string>()
const fileuserid = ref<string>('')


const DocType = reactive([
    `${t('share.shareable')}`,
    `${t('share.need_to_apply_for_confirmation')}`,
    `${t('share.anyone_can_read_it')}`,
    `${t('share.anyone_can_comment')}`,
    `${t('share.anyone_can_edit_it')}`
])


const documentShareURL = computed(() => {
    return route.path !== '/pageviews'
        ?
        location.origin + `/pageviews?id=${docID.value}` + ' ' + `邀请您进入《${(docInfo.value as DocInfo).document.name}》，点击链接开始协作`
        :
        location.href + ' ' + `邀请您进入《${(docInfo.value as DocInfo).document.name}》，点击链接开始协作`
})


//获取文档信息
const getDocumentInfo = async () => {
    loading.value = true
    try {
        const { code, data, message } = await share_api.getDocumentInfoAPI({ doc_id: docID.value })
        loading.value = false
        if (code === 0) {
            docInfo.value = data as DocInfo;
            selectDefault.value = docInfo.value.document.doc_type;
            fileuserid.value = docInfo.value.user.id
            // projectPerm.value = docInfo.value.document_permission.perm_type
        } else {
            errormessage.value = message
        }
    } catch (err) {
        console.log(err);
    }

}

const projectPerm = computed(() => {
    let type: any
    projectlist.value.forEach((item: any) => {
        if (docInfo.value?.project !== null) {
            if (item.project.id === docInfo.value?.project.id) {
                type = item.self_perm_type
            }
        }
    })
    return type ?? 0
})


//设置分享类型
const setShateType = async (type: number) => {
    try {
        await share_api.setShateTypeAPI({ doc_id: docID.value, doc_type: type })
    } catch (err) {
        console.log(err);
    }
}

watchEffect(() => {
    //文档所有者的ID
    if (projectPerm.value) {
        if (projectPerm.value > 3) {
            return founder.value = true;
        } else {
            if (projectPerm.value === 3 && UserId === fileuserid.value) {
                return founder.value = true;
            } else {
                return founder.value = false;
            }
        }
    } else {
        UserId !== fileuserid.value ? founder.value = false : founder.value = true
    }
});

//复制分享链接
const copyLink = async () => {
    console.log(window);

    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(documentShareURL.value).then(() => {
            ElMessage({
                message: `${t('share.copy_success')}`,
                type: 'success',
            })
        }, () => {
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

watch(selectValue, () => {
    if (selectValue.value === selectDefault.value) return
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
    selectDefault.value = selectValue.value
})

onMounted(() => {
    getDocumentInfo()
})

</script>

<template>
    <div class="share">
        <!-- <div class="header">
            <svg-icon icon-class="back-icon" @click.stop="userlist ? userlist = false : router.go(-1)"></svg-icon>
            <span>{{ t('miniprogram.share_title') }}</span>
        </div> -->
        <div v-if="docInfo" class="content">
            <div style="color: #8C8C8C;margin: 16px 16px 8px 16px;">{{ t('miniprogram.permissions') + (docInfo.project ?
            '（文件所在项目所有成员固定可见）' : '') }}
            </div>
            <!-- 普通视图 -->
            <div v-if="!founder" class="normal-view">
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
            <div v-if="founder" class="creator-view">
                <!-- <div class="everyone" @click.stop="selectValue = 2">
                    <div class="select" :style="{ visibility: [2, 3, 4].includes(selectValue) ? 'visible' : 'hidden' }">
                    </div> -->
                <div class="private" @click="selectValue = 0">
                    <span>{{ t('miniprogram.myself') }}</span>
                    <div class="select" :style="{ visibility: selectDefault === 0 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="application" @click="selectValue = 1">
                    <span>{{ t('miniprogram.confirm') }}</span>
                    <div class="select" :style="{ visibility: selectDefault === 1 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="readOnly" @click="selectValue = 2">
                    <span>{{ t('share.anyone_can_read_it') }}</span>
                    <div class="select" :style="{ visibility: selectDefault === 2 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="reviewable" @click="selectValue = 3">
                    <span>{{ t('share.anyone_can_comment') }}</span>
                    <div class="select" :style="{ visibility: selectDefault === 3 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
                <div class="editable" @click="selectValue = 4">
                    <span>{{ t('share.anyone_can_edit_it') }}</span>
                    <div class="select" :style="{ visibility: selectDefault === 4 ? 'visible' : 'hidden' }">
                        <svg-icon icon-class="mselect-icon"></svg-icon>
                    </div>
                </div>
            </div>
            <!-- 已加入分享的人 -->
            <div v-if="founder" class="share-user"
                @click="router.push({ name: 'member', query: { id: route.query.id } })">
                <span>{{ t('miniprogram.share_users') }}</span>
                <div class="left-info">
                    <!-- <span style="color: #c8c8c8;">{{ listuser }}人</span> -->
                    <svg-icon icon-class="arrows-icon"></svg-icon>
                </div>
            </div>
            <!-- 分享到 -->
            <Transition enter-active-class="animate__animated animate__fadeInUp"
                leave-active-class="animate__animated animate__fadeOutDown">
                <div v-if="selectDefault !== 0" class="share-to">
                    <div class="title">{{ t('miniprogram.share_to') }}</div>
                    <div class="type">
                        <!-- <div class="link" @click.stop="copyLink">
                            <div class="left">
                                <svg-icon icon-class="wechat-icon"></svg-icon>
                                <span>微信</span>
                            </div>
                            <div class="right">
                                <svg-icon icon-class="arrows-icon"></svg-icon>
                            </div>
                        </div> -->
                        <div class="link" @click.stop="copyLink">
                            <div class="left">
                                <svg-icon icon-class="link-icon"></svg-icon>
                                <span>{{ t('miniprogram.copy_link') }}</span>
                            </div>
                            <div class="right">
                                <svg-icon icon-class="arrows-icon"></svg-icon>
                            </div>
                        </div>
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
                display: flex;
                align-items: center;
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
        height: 100%;

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