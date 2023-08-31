<template>
    <div class="title">
        <div class="left">
            <p>项目1</p>
            <span>项目描述</span>
        </div>
        <div class="right"></div>
    </div>
    <div class="team-header">
        <ul class="menu">
            <li class="item" :class="{ 'activate': itemid === index }" v-for="(item, index) in items" :key="index"
                @click.stop="clickEvent(index)">
                {{ item }}
            </li>
        </ul>
    </div>
    <ProjectFillList v-if="itemid === 0" :projectList="projectList"></ProjectFillList>
    <ProjectRecycleBin v-if="itemid === 1" :projectList="projectList"></ProjectRecycleBin>
</template>
<script setup lang="ts">
import { Ref, computed, inject, ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import * as user_api from '@/apis/users'
import ProjectFillList from './ProjectFill/ProjectFillList.vue';
import ProjectRecycleBin from './ProjectFill/ProjectRecycleBin.vue';

const itemid = ref(0)
const items = ['文件', '回收站',]
const route = useRoute();
const currentProject = ref({});

interface data {
    team: {
        id: string,
        name: string,
        avatar: string,
        description: string
    }
}

const { teamData, teamID, teamName, teamAvatar, teamDescription, projectList } = inject('shareData') as {
    teamData: Ref<[{
        team: {
            id: string,
            name: string,
            avatar: string,
            description: string
        }
    }]>;
    teamID: Ref<string>;
    teamName: Ref<string>;
    teamAvatar: Ref<string>;
    teamDescription: Ref<string>;
    projectList: Ref<any[]>;
}

const clickEvent = (index: number) => {
    itemid.value = index
}

watchEffect(() => {
    currentProject.value = {}
    currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id)
})

onMounted(() => {
})
</script>
<style lang="scss" scoped>
.nested-enter-active,
.nested-leave-active {
    transition: all 0.3s ease-in-out;
}

.nested-leave-active {
    transition-delay: 0.25s;
}

.nested-enter-from,
.nested-leave-to {
    transform: translateY(400px);
    opacity: 0;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
    transition: all 0.3s ease-in-out;
}

.nested-enter-active .inner {
    transition-delay: 0.25s;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.001;
}

.activate {
    color: black;
    border-bottom: 2px solid #9775fa;
}

.team-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 24px 8px 24px;
    padding: 12px;
    border-bottom: 1px solid #c4c4c4cf;

    .menu {
        cursor: pointer;
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;

        color: #666;

        .item {
            margin-right: 32px;
            font-size: 18px;
            font-weight: 600;
            padding-bottom: 6px;
        }
    }

    .addandsearch {
        display: flex;

        button {
            cursor: pointer;
            border: none;
            width: 120px;
            height: 40px;
            border-radius: 4px;
            background-color: #9775fa;
            box-sizing: border-box;
            margin-right: 12px;
            transition: all 0.5s ease-out;
            color: white;

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }
        }

        .el-input {
            width: 280px;
            height: 40px;
            font-size: 12px;
            --el-input-border-color: #f3f0ff;
            --el-input-hover-border-color: #e5dbff;
            --el-input-focus-border-color: #9775fa;

            .close:hover {
                border-radius: 2px;
                cursor: pointer;
                background-color: #f3f0ff;
            }

            .el-icon {
                padding: 2px;
                color: #9775fa;
            }
        }
    }
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
    background-color: #9775fa;
    margin-top: 30px;
    padding: 12px;
    margin: 32px 24px 8px 24px;
    box-sizing: border-box;

    .left {
        p {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            margin-bottom: 10px;
        }

        span {
            font-size: 10px;
            color: rgba(0, 0, 0, 0.5);
        }
    }

    .right {
        width: 70px;
        height: 30px;
        background-color: #666
    }
}
</style>
