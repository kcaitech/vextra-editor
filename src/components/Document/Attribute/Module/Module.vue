<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import { ref, nextTick } from 'vue'
import ComponentAttr from './ComponentAttr.vue';
import ComponentState from './ComponentState.vue';
import InstanceAttr from './InstanceAttr.vue';
import LayerShow from './LayerShow.vue';
import TextContent from './TextContent.vue';
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();

</script>

<template>
    <div class="module-panel">
        <ComponentAttr :context="context"></ComponentAttr>
        <ComponentState :context="context"></ComponentState>
        <InstanceAttr :context="context"></InstanceAttr>
        <LayerShow :context="context"></LayerShow>
        <TextContent :context="context"></TextContent>
    </div>
</template>

<style scoped lang="scss">
.module-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
}
</style>