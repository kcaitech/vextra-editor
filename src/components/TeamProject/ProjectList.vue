<template>
    <div v-if="!noNetwork">
        <div v-if="!showbutton" class="container">
            <div class="hearder-container">
                <div class="title" v-for="(item, index) in titles" :key="index">{{ item }}</div>
            </div>
            <div class="main">
                <div class="project-item" :class="{ 'selected': selectid === id }"
                    v-for="{ project: { name, id, description }, creator: { nickname } } in searchvalue === '' ? teamprojectlist : SearchList"
                    :key="id" @click.stop="selectid = id">
                    <div class="project-name">{{ name }}</div>
                    <div class="project-description">{{ description }}</div>
                    <div class="project-creator">{{ nickname }}</div>
                    <div class="other">
                       <div><svg-icon icon-class="frame"></svg-icon></div>
                       <div><svg-icon icon-class="drag"></svg-icon></div>
                       <div><svg-icon icon-class="pattern-ellipse"></svg-icon></div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="datanull">
            <p>未加入任何项目</p>
            <button type="button" @click.stop="emits('addproject')">新建项目</button>
        </div>
    </div>
    <NetworkError v-else @refresh-doc="GetprojectLists"></NetworkError>
</template>
<script setup lang="ts">
import { Ref, computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
import NetworkError from '@/components/NetworkError.vue'

interface Props {
    searchvalue?: string
}

const showbutton = ref(false)
const noNetwork = ref(false)
const { t } = useI18n()
const titles = ['项目名称', '项目描述', '创建者', '操作',]
const projectdata = ref<any[]>([])
const selectid = ref(0)

const emits = defineEmits<{
    (e: 'addproject'): () => void
}>()

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})

const { teamID, updateprojectlist, updateprojectliststate } = inject('shareData') as {
    updateprojectlist: Ref<boolean>;
    updateprojectliststate: (b: boolean) => void;
    teamID: Ref<string>;
};

const GetprojectLists = async () => {
    try {
        const { code, data, message } = await user_api.GetprojectLists()
        if (code === 0) {
            projectdata.value = data
            ElMessage.success('成功获取项目列表')
            if (noNetwork.value) noNetwork.value = false
        } else {
            ElMessage({ type: 'error', message: message })
        }
    } catch (error) {
        noNetwork.value = true
        ElMessage.closeAll('error')
        ElMessage.error({ duration: 1500, message: t('home.failed_list_tips') })
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
const teamprojectlist = computed(() => {
    return projectdata.value.filter((item) => item.project.team_id === teamID.value)
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



//通过计算属性，筛选出与搜索匹配的项目
const SearchList = computed(() => {
    return teamprojectlist.value.filter((el: any) => {
        return el.project.name.toLowerCase().includes(props.searchvalue.toLowerCase())
            ||
            el.creator.nickname.toLowerCase().includes(props.searchvalue.toLowerCase())
    })
})

onMounted(() => {
    GetprojectLists()
})

</script>
<style lang="scss" scoped>
.selected {
    background-color: #e5dbff;
}

.container {
    margin: 0 32px;

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
