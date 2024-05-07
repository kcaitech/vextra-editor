<template>
    <!-- 分享的人员列表 -->
    <div class="share-user-list">
        <div v-for="(item, ids) in shareList" :key="ids" class="scrollbar-demo-item">
            <div class="item-left">
                <div class="avatar"><img :src="item.user.avatar"></div>
                <div class="name">{{ item.user.nickname }}</div>
            </div>
            <div class="item-right">
                <div class="authority">{{ permission[item.document_permission.perm_type] }}</div>
            </div>
        </div>
        <div v-if="!shareList.length && !loading" class="null">
            <span>{{ t('miniprogram.share_users_null') }}</span>
        </div>
        <div v-if="loading" class="loading">
            <Loading :size="20"></Loading>
        </div>
    </div>

</template>

<script setup lang="ts">
import * as share_api from '@/request/share';
import { onMounted, reactive, ref } from 'vue';
import Loading from '../common/Loading.vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
const route = useRoute()
const shareList = ref<any[]>([])
const loading = ref<boolean>(false)
const docID = ref<string>(route.query.id as string)

enum permissions {
    noAuthority,
    readOnly,
    reviewable,
    editable
}

const permission = reactive([
    `${t('share.no_authority')}`,
    `${t('share.readOnly')}`,
    `${t('share.reviewable')}`,
    `${t('share.editable')}`
])

//获取当前文件分享列表
const getShareList = async () => {
    loading.value = true
    try {
        const { code, data, message } = await share_api.getShareListAPI({ doc_id: docID.value })
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

//是否显示权限编辑菜单
const selectAuthority = (i: number, e: Event) => {
    e.stopPropagation()
    // if (isSelectOpen.value) isSelectOpen.value = false
    // authority.value = !authority.value
    // index.value = i
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

onMounted(() => {
    getShareList()
})

</script>

<style lang="scss" scoped>
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
</style>
