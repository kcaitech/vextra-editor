<template>
    <div class="container">
        <div class="hearder-container">
            <div class="title" v-for="(item, index) in titles" :key="index">{{ item }}</div>
        </div>
        <div class="main" v-if="!noNetwork">
            <div class="project-item" :class="{ 'selected': selectid === id }"
                v-for="{ project: { name, id, description }, creator: { nickname }, self_perm_type } in searchvalue === '' ? teamprojectlist : SearchList"
                :key="id" @click.stop="selectid = id">
                <div class="project-name">{{ name }}</div>
                <div class="project-description">{{ description }}</div>
                <div class="project-creator">{{ nickname }}</div>
                <div class="other">
                    {{ self_perm_type }}
                </div>
            </div>
        </div>
        <NetworkError v-else></NetworkError>
    </div>
</template>
<script setup lang="ts">
import { Ref, computed, inject, onMounted, ref, watch } from 'vue';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'
import NetworkError from '@/components/NetworkError.vue'

const noNetwork = ref(false)
const { t } = useI18n()
interface Props {
    teamid: string
    searchvalue?: string
}

const props = withDefaults(defineProps<Props>(), {
    searchvalue: ''
})

const { updateprojectlist, updateprojectliststate } = inject('shareData') as {
    updateprojectlist: Ref<boolean>;
    updateprojectliststate: (b: boolean) => void;
};

const titles = ['项目名称', '项目描述', '创建者', '操作',]
const projectdata = ref<any[]>([])
const selectid = ref(0)

const GetprojectLists = async () => {
    try {
        const { code, data, message } = await user_api.GetprojectLists()
        if (code === 0) {
            projectdata.value = data
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
watch(updateprojectlist, (newvalue) => {
    if (newvalue) {
        GetprojectLists()
        updateprojectliststate(false)
    }
})

//获取当前用户所有项目列表,然后用计算属性筛选出当前团队的项目
const teamprojectlist = computed(() => {
    return projectdata.value.filter((item) => item.project.team_id === props.teamid)
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

        }
    }
}
</style>
