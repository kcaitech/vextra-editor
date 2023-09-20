
<template>
    <div>
        <div class="team">
            <div class="team-info">
                <div class="team-name">{{t('Createteam.sharetip')}}</div>
            </div>
        </div>
        <ProjectShareList />
    </div>
</template>
<script setup lang="ts">
import ProjectShareList from './ProjectShareList.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n();

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
