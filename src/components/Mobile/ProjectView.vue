<template>
    <div class="project">
        <div class="header">
            <svg-icon icon-class="back-icon"></svg-icon>
            <span>分享</span>
        </div>
        <div class="list">
            <TeamItem :data="projectlist"></TeamItem>
        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { GetteamList, GetprojectLists } from './team'
import { router } from '@/router'
import { useRoute } from 'vue-router'
const projectlist = ref<any[]>([])

const route = useRoute()


onMounted(async () => {
    if (route.query.id)
        if (route) {
            projectlist.value = await GetprojectLists(Number(route.query.id))
        }
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
