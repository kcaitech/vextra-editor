<template>
    <div class="project">
        <!-- <div class="header">
            <svg-icon icon-class="back-icon" @click="router.go(-1)"></svg-icon>
            <span>{{ route.query.name }}</span>
        </div> -->
        <div class="list">
            <ProjectItem :data="projectlist"></ProjectItem>
        </div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router'
import ProjectItem from './ProjectItem.vue';
import { router } from '@/router';
import { useCounterStore } from './team'
import { storeToRefs } from 'pinia'

const store = useCounterStore()
const { projectlist } = storeToRefs(store)
const { GetprojectLists } = store
const route = useRoute()


onMounted(async () => {
    document.title = route.query.name as string
    await GetprojectLists()
})

</script>

<style lang="scss" scoped>
.project {
    height: 100%;
    width: 100%;
    background-color: #FAFAFA;


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
        height: 100%;
        overflow-y: scroll;
        padding: 0 14px;
    }
}
</style>
