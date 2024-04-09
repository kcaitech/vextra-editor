<template>
    <div class="project">
        <div class="header">
            <svg-icon icon-class="back-icon" @click="router.go(-1)"></svg-icon>
            <span>{{ teamname }}</span>
        </div>
        <div class="list">
            <ProjectItem :data="projectlist"></ProjectItem>
        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { GetteamList, GetprojectLists } from './team'
import { useRoute } from 'vue-router'
import ProjectItem from './ProjectItem.vue';
import { router } from '@/router';

const projectlist = ref<any[]>([])

const route = useRoute()
const teamname = ref<string>(route.query.name as string)

const getlist = async () => {
    const data = await GetprojectLists()
    projectlist.value = data.filter((item: any) => item.project.team_id === route.query.id)
}

window.addEventListener('popstate', function(event) {
    event.stopPropagation()
    console.log("Location: " + document.location + ", State: " + JSON.stringify(event.state));
});

onMounted(() => {
    getlist()
})
</script>

<style lang="scss" scoped>
.project {
    height: 100%;
    width: 100%;
    background-color: #fff;


    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 44px;

        svg {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 14px;
        }

        span {}
    }

    .list {
        height: calc(100% - 44px);
        overflow-y: scroll;
        padding: 0 14px;
    }
}
</style>
