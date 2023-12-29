
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
