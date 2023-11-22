<script setup lang="ts">
import LableType from './LableType.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
</script>

<template>
    <div class="container">
        <LableType :title="t('lable.select_multiple_layers')">
            <template #select>
                <div class="palce"></div>
            </template>
        </LableType>
    </div>
</template>

<style scoped lang="scss">
.palce {
    height: 30px;
}
</style>