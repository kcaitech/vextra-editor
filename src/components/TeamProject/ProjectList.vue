<template>
    <div v-if="!noNetwork">
        <div v-if="!showbutton" class="container">
            <div class="hearder-container">
                <div class="title" v-for="(item, index) in titles" :key="index">{{ item }}</div>
            </div>
            <div class="main">
                <div class="project-item" :class="{ 'selected': selectid === item.project.id }"
                    v-for="(item, index) in searchvalue === '' ? teamprojectlist : SearchList"
                    :key="item.project.id" @click.stop="selectid = item.project.id" @dblclick.stop="skipProject(item.project.id)">
                    <div class="project-name">{{ item.project.name }}</div>
                    <div class="project-description">{{ item.project.description }}</div>
                    <div class="project-creator">{{ item.creator.nickname }}</div>
                    <div class="other">
                        <div @click="cancelFixed(item.project.id, item.is_favor, index)">
                            <svg t="1693476333821" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="15755" width="24" height="24">
                                <path
                                    d="M0 0m256 0l512 0q256 0 256 256l0 512q0 256-256 256l-512 0q-256 0-256-256l0-512q0-256 256-256Z"
                                    :fill="item.is_favor ? '#9775fa' : '#999'" p-id="15756"
                                    data-spm-anchor-id="a313x.search_index.0.i11.6fa73a817d52QG" class="">
                                </path>
                                <path
                                    d="M256 767.6416l202.9568-160.9216 80.9728 86.1184s33.792 9.216 35.8656-16.384l-2.0736-87.1424 119.936-138.368 52.2496-3.0464s41.0112-8.2432 11.2896-44.0832l-146.5856-147.584s-39.936-5.12-36.8896 31.744v39.9872l-136.2944 115.8912-84.0192 5.0688s-30.7712 10.24-19.5072 36.9152l78.9504 77.9008L256 767.6416z"
                                    fill="#FFFFFF" p-id="15757" data-spm-anchor-id="a313x.search_index.0.i10.6fa73a817d52QG"
                                    class="">
                                </path>
                            </svg>
                        </div>
                        <div @click.stop="skipProject(item.project.id)"><svg-icon icon-class="drag"></svg-icon></div>
                        <div><svg-icon icon-class="pattern-ellipse"></svg-icon></div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="datanull">
            <p>未加入任何项目</p>
            <button type="button" @click.stop="onAddproject">新建项目</button>
        </div>
    </div>
    <NetworkError v-else @refresh-doc="GetprojectLists"></NetworkError>
</template>
<script setup lang="ts">
import { Ref, computed, inject, watchEffect, onMounted, ref, watch } from 'vue';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
import NetworkError from '@/components/NetworkError.vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import { Operation } from '@element-plus/icons-vue'
import * as team_api from '@/apis/team'

interface Props {
    searchvalue?: string
}
const route = useRoute();
const showbutton = ref(false)
const noNetwork = ref(false)
const { t } = useI18n()
const titles = ['项目名称', '项目描述', '创建者', '操作',]
const selectid = ref(0)
const projectLists = ref<any[]>([])
const teamprojectlist = ref<any[]>([])
const emits = defineEmits<{
    (e: 'addproject'): void
}>()

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})

const { teamID, updateprojectlist, updateprojectliststate, projectList, saveProjectData, is_favor, favoriteList, updateFavor } = inject('shareData') as {
    updateprojectlist: Ref<boolean>;
    updateprojectliststate: (b: boolean) => void;
    teamID: Ref<string>;
    projectList: Ref<any[]>;
    favoriteList: Ref<any[]>;
    saveProjectData: (data: any[]) => void;
    is_favor: Ref<boolean>;
    updateFavor: (b: boolean) => void;
};

const favoriteProjectList = (arr1: any[], arr2: any[]) => {
    const projectList = arr1.map(item => {
        item.is_favor = arr2.some(value => value.project.id === item.project.id)
        return item;
    })
    return projectList;
}
const onAddproject = () => {
    emits('addproject');
}

const GetprojectLists = async () => {
    try {
        const { code, data, message } = await user_api.GetprojectLists()
        if (code === 0) {
            const project = favoriteProjectList(data, favoriteList.value)
            saveProjectData(project)
            projectLists.value = project
            teamprojectlist.value = project.filter((item) => item.project.team_id === teamID.value)
            if (noNetwork.value) noNetwork.value = false
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {
        noNetwork.value = true
    }
}

//监听updateprojectlist的值，为true的时候，重新获取列表，然后调用updateprojectliststate重新设为false
watch(updateprojectlist, () => {
    if (updateprojectlist.value) {
        GetprojectLists()
        updateprojectliststate(false)
    }
})

//获取当前用户所有项目列表,然后用计算属性筛选出当前团队的项目
watchEffect(() => {
    teamprojectlist.value = projectList.value.filter((item) => item.project.team_id === teamID.value)
})

watch(teamprojectlist, () => {
    setTimeout(() => {
        if (teamprojectlist.value.length === 0) {
            showbutton.value = true
        } else {
            showbutton.value = false
        }
    }, 300);
})

watch(is_favor, () => {
    const timer = setTimeout(() => {
        teamprojectlist.value = projectList.value.filter((item) => item.project.team_id === teamID.value)
        clearTimeout(timer)
    }, 300)
})

//通过计算属性，筛选出与搜索匹配的项目
const SearchList = computed(() => {
    return teamprojectlist.value.filter((el: any) => {
        return el.project.name.toLowerCase().includes(props.searchvalue.toLowerCase())
            ||
            el.creator.nickname.toLowerCase().includes(props.searchvalue.toLowerCase())
    })
})

const skipProject = (id: string) => {
    router.push({ path: '/apphome/project/' + id });
}

const setProjectIsFavorite = async (id: string, state: boolean) => {
    try {
        await team_api.setProjectIsFavoriteAPI({ project_id: id, is_favor: state });
    } catch (err) {
        console.log(err);
    }
}

const cancelFixed = (id: string, state: boolean, index: number) => {
    if (props.searchvalue === '') {
        teamprojectlist.value[index].is_favor = !state;
    } else {
        SearchList.value[index].is_favor = !state;
    }
    const i = projectList.value.findIndex(item => item.project.id === id);
    projectList.value[i].is_favor = !state;
    setProjectIsFavorite(id, !state);
    updateFavor(!is_favor.value);
}

onMounted(() => {
    if(!teamprojectlist.value) {
        GetprojectLists();
    }
})

</script>
<style lang="scss" scoped>
.selected {
    background-color: #e5dbff;
}

.container {

    .hearder-container {
        display: flex;

        .title {
            flex: 1;
            font-weight: 600;
        }
    }

    .project-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        height: 40px;
        border-radius: 4px;
        margin: 6px 0;
        padding: 0 6px;

        &:hover {
            background-color: #f3f0ff;
        }

        .project-name,
        .project-description,
        .project-creator,
        .other {
            flex: 1;
            display: flex;

            svg {
                width: 16px;
                height: 16px;
            }

            >div {
                margin-right: 10px;
            }
        }
    }
}

.datanull {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 240px;

    button {
        cursor: pointer;
        border: none;
        width: 120px;
        height: 40px;
        border-radius: 4px;
        background-color: #9775fa;
        box-sizing: border-box;
        transition: all 0.5s ease-out;
        color: white;

        &:hover {
            background-color: rgba(150, 117, 250, 0.862745098);
        }
    }
}
</style>
