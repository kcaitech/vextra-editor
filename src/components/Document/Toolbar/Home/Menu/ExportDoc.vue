<script setup lang="ts">
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import { exportDocument } from "@/io";

const { t } = useI18n();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const props = defineProps<{
    context: Context
}>();

const exportDoc = () => {
    exportDocument(props.context);
    emit('close');
}

</script>
<template>
    <span @click.stop="exportDoc">{{ t('io.export_doc') }}</span>
</template>
<style scoped lang="scss"></style>