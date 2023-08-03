<script setup lang="ts">
import { Context } from '@/context';
import ColInfo from './ColInfo.vue'
import { UserSelection } from '@/context/selection'
import { onMounted, onUnmounted, ref } from 'vue'
import { Selection } from '@/context/selection';
interface Props {
    context: Context
}
const props = defineProps<Props>();
const showList = ref(false)
const userInfoList = ref<UserSelection[]>(props.context.selection.getUserSelection)

const userList = () => {
    if(showList.value) return showList.value = false
    showList.value = true
    document.addEventListener('click', onShowUserList);
}

const onShowUserList = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.personnel_list')) {
        showList.value = false;
        props.context.workspace.focusText()
        document.removeEventListener('click', onShowUserList);
    }
}

const selectionUpdate = (t: number) => {
    if(t === Selection.CHANGE_USER_STATE) {
        userInfoList.value =  props.context.selection.getUserSelection
    }
}

onMounted(() => {
    props.context.selection.watch(selectionUpdate)
})
onUnmounted(() => {
    props.context.selection.unwatch(selectionUpdate)
})
</script>

<template>
    <div class="synergy_container">
        <template v-for="(item, index) in userInfoList" :key="index">
            <ColInfo :context="context" :info="(item as UserSelection)" v-if="index < 3"></ColInfo>
        </template>
        <div class="info_num" v-if="userInfoList.length > 3" @click.stop="userList">
            <div>
                {{ userInfoList.length }}
            </div>
            <div class="personnel_list" v-if="showList" @click.stop>
                <div class="title">正在访问的人:</div>
                <el-scrollbar height="150px">
                    <div class="info" v-for="(item, index) in userInfoList" :key="index">
                        <div class="user">
                            <div class="avatar"><img :src="item.avatar" alt=""></div>
                            <div class="name">{{ item.userInfo.name }}</div>
                        </div>
                        <div class="perm">{{ item.userInfo.perm }}</div>
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
                    background-color: red;
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