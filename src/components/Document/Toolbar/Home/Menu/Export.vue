<script setup lang="ts">
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


const props = defineProps<{
    context: Context
}>();

const exportClick = () => {
    props.context.menu.setExportDialog(true);
    // popoverVisible.value = false;
}

</script>
<template>

    <span @click.stop="exportClick">{{ t('cutoutExport.export_cutout') }}</span>

</template>
<style scoped lang="scss"></style>