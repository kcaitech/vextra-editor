<script setup lang="ts">
import { Context } from '@/context';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { DocSelectionData } from "@/communication/modules/doc_selection_op";
const { t } = useI18n();
interface Props {
    context: Context
    info: DocSelectionData
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'skipShape', data: DocSelectionData): void;
}>();
const showInfo = ref(false);
const timer = ref();
const showStaffInfo = () => {
    timer.value = setTimeout(() => {
        showInfo.value = true;
    }, 500);
}
const closeStaff = () => {
    showInfo.value = false;
    clearTimeout(timer.value);
}

const onSkip = () => {
    emit('skipShape', props.info);
}

const filterPerm = (perm?: number) => {
    if(perm === 1) {
        return t('share.readOnly');
    }else if (perm === 2) {
        return t('share.reviewable');
    }else if (perm === 3) {
        return t('share.editable');
    }
}
</script>

<template>
    <div class="info_container" @mouseenter="showStaffInfo" @mouseleave="closeStaff">
        <img :src="info.avatar" alt="" @click="onSkip">
        <div class="popup" v-if="showInfo">
            <div>
                <div class="avatar"><img :src="info.avatar" alt=""></div>
                <div class="name">{{ info.nickname }}</div>
            </div>
            <div>
                <div class="author">{{t('home.permissions')}}:</div>
                <div class="perm">{{ context.comment.isDocumentInfo?.user.id === info.user_id ? t('share.founder') : filterPerm(info.permission) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.info_container {
    position: relative;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    text-align: center;
    margin-left: 3px;
    font-size: var(--font-default-fontsize);
    >img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
    .popup {
        position: absolute;
        top: 33px;
        left: 0;
        width: 100px;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        padding: var(--default-padding-half) 0;
        >div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 30px;
            width: 100%;
            padding: 0 var(--default-padding-half);
            box-sizing: border-box;
        }
        .avatar {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            >img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }
        .name {
            width: 60%;   
            white-space: nowrap; /* 禁止换行 */
            overflow: hidden;    /* 超出部分隐藏 */
            text-overflow: ellipsis;         
        }
        .author {
            width: 40%;
        }
        .perm {
            width: 60%;
        }
    }
}
</style>