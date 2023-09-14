
<template>
    <div>
        <div class="team">
            <div class="team-info">
                <div class="team-name">收到的分享项目</div>
            </div>
        </div>
        <ProjectShareList />
    </div>
</template>
<script setup lang="ts">
import { Ref, inject, onMounted, onUnmounted } from 'vue'
import ProjectShareList from './ProjectShareList.vue'


interface data {
    team: {
        id: string,
        name: string,
        avatar: string,
        description: string
    }
}

const { teamData, teamID, teamName, teamAvatar, teamDescription } = inject('shareData') as {
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
}

onMounted(() => {
})

onUnmounted(() => {
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

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.activate {
    color: black;
    border-bottom: 2px solid #9775fa;
}


.team {
    display: flex;
    margin: 16px 0px;
    align-items: center;

    .team-info {
        display: flex;
        flex-direction: column;
        margin: 0 12px;

        .team-name {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
    }
}
</style>
