<script setup lang="ts">
import { Context } from '@/context';
import ColInfo from './ColInfo.vue'
interface Props {
    context: Context
}
const props = defineProps<Props>();
const info = [
    {
        name: '李四',
        perm: '创建者'
    },
    {
        name: '张三',
        perm: '可读'
    },
    {
        name: '奥利',
        perm: '可编辑'
    },
    {
        name: '王麻1111111111111111',
        perm: '可评论'
    },
]
</script>

<template>
    <div class="synergy_container">
        <template v-for="(item, index) in info" :key="index">
            <ColInfo :context="context" :userInfo="info"  :info="item" v-if="index < 3"></ColInfo>
        </template>
        <div class="info_num" v-if="info.length > 3">
            <div>
                {{ info.length }}
            </div>
            <div class="personnel_list">
                <div class="title">正在访问的人:</div>
                <div class="info" v-for="(item, index) in info" :key="index">
                    <div class="user">
                        <div class="avatar"></div>
                        <div class="name">{{ item.name }}</div>
                    </div>
                    <div class="perm">{{ item.perm }}</div>
                </div>
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
            height: 200px;
            border-radius: 4px;
            background-color: #fff;
            border: 1px solid #ccc;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 990;
            padding: var(--default-padding);
            .title {
                height: 20px;
                width: 100%;
            }
            .info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 30px;
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
</style>