/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const props = defineProps<{
    context: Context
}>();

const exportClick = () => {
    props.context.menu.setExportDialog(true);
    // popoverVisible.value = false;
    emit('close');
}

</script>
<template>

    <span @click.stop="exportClick">{{ t('cutoutExport.export_cutout') }}</span>

</template>
<style scoped lang="scss"></style>