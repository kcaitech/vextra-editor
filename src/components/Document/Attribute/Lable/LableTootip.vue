<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const props = defineProps<{
    copy_text: boolean,
    offset?: number,
    visible: boolean,
    copy?: string,
    placement?: string
}>();

onMounted(() => {
})
</script>

<template>
    <el-tooltip class="box-item" effect="dark" :placement="placement ? placement : 'left'" :offset="offset || 10"
        :visible="visible">
        <template #content>
            <span>{{ copy_text ? `${t('lable.copied')}` : copy ? copy : `${t('lable.click_copy')}` }}</span>
        </template>
        <slot />
    </el-tooltip>
</template>

<style scoped lang="scss"></style>
