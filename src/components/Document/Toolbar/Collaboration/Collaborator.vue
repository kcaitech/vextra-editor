<script setup lang="ts">
import { Context } from '@/context';
import ColInfo from './ColInfo.vue';
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { Shape } from '@kcdesign/data';
import { skipUserSelectShapes } from '@/utils/content';
import { useI18n } from 'vue-i18n';
import { DocSelectionData } from "@/communication/modules/doc_selection_op";
import { TeamWork } from "@/context/teamwork";
const { t } = useI18n();
interface Props {
    context: Context
}
const props = defineProps<Props>();
const showList = ref(false);
const userInfoList = ref<DocSelectionData[]>([]);
const refresh = ref(0);
const userList = () => {
    if(showList.value) return showList.value = false;
    showList.value = true;
    document.addEventListener('click', onShowUserList);
}

const onShowUserList = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.personnel_list')) {
        showList.value = false;
        props.context.workspace.focusText();
        document.removeEventListener('click', onShowUserList);
    }
}

const selectionUpdate = (t: number) => {
    if(t === TeamWork.CHANGE_USER_STATE) {
        userInfoList.value =  props.context.teamwork.getUserSelection;
        refresh.value++;
    }
}

function skipUserSelectShape(data: DocSelectionData) {
    if (props.context.selection.selectedPage?.id !== data.select_page_id) {
        //如果该用户不在当前页面则跳转
        props.context.selection.selectCommentPage(data.select_page_id);
    }
    nextTick(() => {
        const page = props.context.selection.selectedPage;        
        const shapes: Shape[] = [];
        const len = data.select_shape_id_list.length;
        for (let i = 0; i < len; i++) {
            const shape = page!.shapes.get(data.select_shape_id_list[i]);
            if (shape) shapes.push(shape);
        }
        nextTick(() => {
            skipUserSelectShapes(props.context, shapes);
        })
    })
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

onMounted(() => {
    props.context.teamwork.watch(selectionUpdate)
})
onUnmounted(() => {
    props.context.teamwork.unwatch(selectionUpdate)
})
</script>

<template>
    <div class="synergy_container" :refresh="refresh !== 0 ? refresh : undefined">
        <template v-for="(item, index) in userInfoList" :key="index">
            <ColInfo :context="context" :info="(item as DocSelectionData)" v-if="index < 3" @skipShape="skipUserSelectShape"></ColInfo>
        </template>
        <div class="info_num" v-if="userInfoList && userInfoList.length > 3" @click.stop="userList">
            <div>
                {{ userInfoList.length }}
            </div>
            <div class="personnel_list" v-if="showList" @click.stop>
                <div class="title">{{ t('home.people_are_visiting') }}</div>
                <el-scrollbar height="150px">
                    <div class="info" v-for="(item, index) in userInfoList" :key="index" @click="skipUserSelectShape(item)">
                        <div class="user">
                            <div class="avatar"><img :src="item.avatar" alt=""></div>
                            <div class="name">{{ item.nickname }}</div>
                        </div>
                        <div class="perm">{{ context.comment.isDocumentInfo?.user.id === item.user_id ? t('share.founder') : filterPerm(item.permission) }}</div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.synergy_container {
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: var(--font-default-fontsize);
    .info_num {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ccc;
        width: 27px;
        height: 27px;
        border-radius: 50%;
        margin-left: 3px;
        background-color: white;
        box-sizing: border-box;
        .personnel_list {
            position: absolute;
            top: 33px;
            right: 0px;
            width: 150px;
            height: 170px;
            border-radius: 4px;
            background-color: #fff;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 990;
            padding: var(--default-padding);
            padding-right: 5px;
            .title {
                height: 20px;
                width: 100%;
            }
            .info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 30px;
                padding-right: 5px;
                .user {
                    width: calc(100% - 40px);
                    display: flex;
                    align-items: center;
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
                    margin-left: 5px;
                    flex: 1;
                    white-space: nowrap; /* 禁止换行 */
                    overflow: hidden;    /* 超出部分隐藏 */
                    text-overflow: ellipsis;
                }
                .perm {
                    color: rgba(0, 0, 0, .5);
                }
            }
        }
    }
}
.el-scrollbar {
    padding-right: 10px;
    padding-left: 5px;
}
</style>