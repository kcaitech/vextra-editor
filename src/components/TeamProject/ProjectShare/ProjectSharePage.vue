
<template>
    <div class="team">
        <div class="team-name">{{ t('Createteam.sharetip') }}</div>
    </div>
    <ProjectShareList />
</template>
<script setup lang="ts">
import ProjectShareList from './ProjectShareList.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n();

</script>
<style lang="scss" scoped>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.5);
}

.team {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24px 8px;
    box-sizing: border-box;

    .team-name {
        font-size: 18px;
        font-weight: 500;
        line-height: 36px;
        margin-right: 12px;
        color: #000;
    }

}
</style>
