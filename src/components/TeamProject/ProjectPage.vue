<template>
    <div class="title" v-if="currentProject[0]">
        <div class="left">
            <p>项目1</p>
            <span>项目描述</span>
        </div>
        <div class="right">
            <div @click="cancelFixed">
                <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                    p-id="15755" width="24" height="24">
                    <path d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                        :fill="currentProject[0].is_favor ? '#9775fa' : '#999'" p-id="15756"
                        data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                    </path>
                    <path
                        d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                        fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG" class="">
                    </path>
                </svg>
            </div>
            <div class="setting"><svg-icon icon-class="gear"></svg-icon></div>
            <div><el-icon>
                    <User />
                </el-icon></div>
        </div>
    </div>
    <div class="team-header">
        <ul class="menu">
            <li class="item" :class="{ 'activate': itemid === index }" v-for="(item, index) in items" :key="index"
                @click.stop="clickEvent(index)">
                {{ item }}
            </li>
        </ul>
    </div>
    <ProjectFillList v-if="itemid === 0" :currentProject="currentProject[0]"></ProjectFillList>
    <ProjectRecycleBin v-if="itemid === 1" :currentProject="currentProject[0]"></ProjectRecycleBin>
</template>
<script setup lang="ts">
import { Ref, computed, inject, ref, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import * as user_api from '@/apis/users'
import ProjectFillList from './ProjectFill/ProjectFillList.vue';
import ProjectRecycleBin from './ProjectFill/ProjectRecycleBin.vue';
import { User } from '@element-plus/icons-vue';
import * as team_api from '@/apis/team';
const itemid = ref(0)
const items = ['文件', '回收站',]
const route = useRoute();
const currentProject = ref<any[]>([]);

interface data {
    team: {
        id: string,
        name: string,
        avatar: string,
        description: string
    }
}

const { projectList, saveProjectData, is_favor, favoriteList, updateFavor } = inject('shareData') as {
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
};

const clickEvent = (index: number) => {
    itemid.value = index
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}
watch(is_favor, () => {
    const timer = setTimeout(() => {
        currentProject.value = projectList.value.filter((item) => item.project.team_id === route.params.id)
        clearTimeout(timer)
    }, 300)
})

const cancelFixed = () => {
    const project = currentProject.value[0];
    project.is_favor = !project.is_favor;
    setProjectIsFavorite(project.project.id, project.is_favor);
    updateFavor(!is_favor.value);
}

watchEffect(() => {
    currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
    if (!currentProject.value) {
        GetprojectLists()
    }
})

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
    const projectList = arr1.map(item => {
        item.is_favor = arr2.some(value => value.project.id === item.project.id)
        return item;
    })
    return projectList;
}

const GetprojectLists = async () => {
    try {
        const { data } = await user_api.GetprojectLists()
        const project = favoriteProjectList(data, favoriteList.value)
        saveProjectData(project)
        currentProject.value = projectList.value.filter((item) => item.project.id === route.params.id);
    } catch (error) {
        console.log(error);

    }
}

watch(() => currentProject.value, (n) => {
    currentProject.value = n;
}, { deep: true });

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
    margin: 10px 0 8px 0;
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
    margin-top: 30px;
    padding: 12px;
    margin: 32px 0 8px 0;
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
            color: rgba(0, 0, 0, 0.7);
        }
    }

    .right {
        display: flex;
        width: auto;
        height: 30px;

        svg {
            width: 16px;
            height: 16px;
        }


        >div {
            margin-right: 10px;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 2px;

            >svg {
                width: 20px;
                height: 20px;
            }

            &:hover {
                background-color: #e5dbff;
            }
        }

        .setting {
            >svg {
                width: 16px;
                height: 16px;
            }
        }
    }
}

</style>
