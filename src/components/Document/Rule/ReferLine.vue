<script setup lang="ts">
import { useI18n } from 'vue-i18n';


const { t } = useI18n();

import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
</script>
<template>
    <div class="refer-line-container">
        <TypeHeader :title="t('attr.fill')" class="mt-24" :active="true"></TypeHeader>
    </div>
</template>
<style scoped lang="scss">

</style>