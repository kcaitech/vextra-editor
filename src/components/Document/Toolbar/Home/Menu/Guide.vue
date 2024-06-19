<script setup lang="ts">
import { Context } from '@/context';
import { Menu } from '@/context/menu';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
    context: Context
}

const emit = defineEmits<{
    (e: 'close'): void;
}>();
const props = defineProps<Props>();


const guide = () => {
    props.context.menu.notify(Menu.OPEN_SHORTCUTS);
    // popoverVisible.value = false;
    emit('close');
}


</script>
<template>
        <span @click="guide">{{ t('fileMenu.guide') }}</span>

</template>
<style scoped lang="scss">

</style>